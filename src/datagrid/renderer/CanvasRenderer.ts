import { GeometryEngine } from '../core/GeometryEngine';
import { SelectionModel } from '../core/SelectionModel';
import { IDataStore } from '../types/store';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { ColumnTypeRegistry } from '../columns/ColumnTypeRegistry';
import { GroupRowPainter } from './GroupRowPainter';
import { SkeletonPainter } from './SkeletonPainter';
import { SortDescriptor } from '../types/filter';
import { IGridLocale } from '../i18n/IGridLocale';

export interface RenderParams {
  canvas: HTMLCanvasElement;
  geometry: GeometryEngine;
  store: IDataStore;
  selection: SelectionModel;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  scrollLeft: number;
  scrollTop: number;
  sortRules: SortDescriptor[];
  searchKeyword?: string;
  hoveredCell?: { row: number; col: number } | null;
}

export class CanvasRenderer {
  public static render(params: RenderParams): void {
    const {
      canvas,
      geometry,
      store,
      selection,
      theme,
      locale,
      scrollLeft,
      scrollTop,
      sortRules,
      searchKeyword,
      hoveredCell,
    } = params;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Zemin Temizleme
    ctx.fillStyle = theme.canvas.bg;
    ctx.fillRect(0, 0, width, height);

    const rowCount = store.getRowCount();
    const rowH = geometry.rowHeight;
    const headerH = geometry.headerHeight;
    const rowNumW = geometry.rowNumberWidth;

    // 2. Viewport Satır Aralıkları
    const startRow = Math.max(0, Math.floor(scrollTop / rowH));
    const endRow = Math.min(rowCount - 1, Math.ceil((scrollTop + height - headerH) / rowH));

    // Arka planda eksik blok varsa RemoteStore'dan talep et
    store.ensureRange(startRow, endRow);

    // 3. Viewport Sütun Aralıkları (Scrollable)
    let startScrollColIdx = 0;
    let endScrollColIdx = geometry.scrollableColumns.length - 1;

    if (geometry.scrollableColumns.length > 0) {
      startScrollColIdx = geometry.findScrollableColIndexAtX(scrollLeft);
      endScrollColIdx = geometry.findScrollableColIndexAtX(
        scrollLeft + (width - geometry.totalFrozenWidth)
      );
    }

    // ========================================================================
    // SATIRLARI VE HÜCRELERİ ÇİZ (VERİ ALANI)
    // ========================================================================
    for (let r = startRow; r <= endRow; r++) {
      const rowY = headerH + r * rowH - scrollTop;
      const vRow = store.getViewRow(r);

      if (!vRow) {
        // İskelet satırı
        SkeletonPainter.paintSkeletonCell(ctx, rowNumW, rowY, width - rowNumW, rowH, theme);
        continue;
      }

      // GRUP SATIRI ÇİZİMİ
      if (vRow.type === 'group') {
        GroupRowPainter.paintGroupRow(ctx, vRow, rowY, width, rowH, theme, locale);
        continue;
      }

      const rowData = vRow.data;

      // 1. SCROLLABLE SÜTUNLARI ÇİZ
      ctx.save();
      ctx.beginPath();
      ctx.rect(geometry.totalFrozenWidth, headerH, width - geometry.totalFrozenWidth, height - headerH);
      ctx.clip();

      for (let sc = startScrollColIdx; sc <= endScrollColIdx; sc++) {
        const colIdx = geometry.frozenColumns.length + sc;
        const col = geometry.columns[colIdx];
        if (!col) continue;

        const cellX = geometry.totalFrozenWidth + geometry.scrollableColOffsets[sc] - scrollLeft;
        const cellVal = rowData[col.id];
        const isHovered = hoveredCell?.row === r && hoveredCell?.col === colIdx;

        // Search Highlight Kontrolü
        if (searchKeyword && cellVal != null && String(cellVal).toLowerCase().includes(searchKeyword.toLowerCase())) {
          ctx.fillStyle = theme.canvas.searchHighlight;
          ctx.fillRect(cellX, rowY, col.width, rowH);
        }

        // Hücre Tip Çizicisi
        const plugin = ColumnTypeRegistry.get(col.type);
        plugin.paint({
          ctx,
          value: cellVal,
          column: col,
          theme,
          locale,
          x: cellX,
          y: rowY,
          width: col.width,
          height: rowH,
          isSelected: selection.isCellSelected(r, colIdx),
          isHovered,
        });

        // Hücre Sağ ve Alt Kenarlık Çizgisi
        ctx.strokeStyle = theme.canvas.gridLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cellX + col.width - 0.5, rowY);
        ctx.lineTo(cellX + col.width - 0.5, rowY + rowH);
        ctx.moveTo(cellX, rowY + rowH - 0.5);
        ctx.lineTo(cellX + col.width, rowY + rowH - 0.5);
        ctx.stroke();
      }
      ctx.restore();

      // 2. FROZEN SÜTUNLARI ÇİZ (Scrollable alanın üzerine biner)
      let curFrozenX = rowNumW;
      for (let fc = 0; fc < geometry.frozenColumns.length; fc++) {
        const col = geometry.frozenColumns[fc];
        const cellVal = rowData[col.id];
        const isHovered = hoveredCell?.row === r && hoveredCell?.col === fc;

        // Frozen hücre arka planı (arkadaki kayan hücreleri örtmesi için)
        ctx.fillStyle = theme.canvas.bg;
        ctx.fillRect(curFrozenX, rowY, col.width, rowH);

        if (searchKeyword && cellVal != null && String(cellVal).toLowerCase().includes(searchKeyword.toLowerCase())) {
          ctx.fillStyle = theme.canvas.searchHighlight;
          ctx.fillRect(curFrozenX, rowY, col.width, rowH);
        }

        const plugin = ColumnTypeRegistry.get(col.type);
        plugin.paint({
          ctx,
          value: cellVal,
          column: col,
          theme,
          locale,
          x: curFrozenX,
          y: rowY,
          width: col.width,
          height: rowH,
          isSelected: selection.isCellSelected(r, fc),
          isHovered,
        });

        // Kenarlıklar
        ctx.strokeStyle = theme.canvas.gridLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(curFrozenX + col.width - 0.5, rowY);
        ctx.lineTo(curFrozenX + col.width - 0.5, rowY + rowH);
        ctx.moveTo(curFrozenX, rowY + rowH - 0.5);
        ctx.lineTo(curFrozenX + col.width, rowY + rowH - 0.5);
        ctx.stroke();

        curFrozenX += col.width;
      }

      // 3. SATIR NUMARASI SÜTUNU (En sol)
      ctx.fillStyle = theme.canvas.rowNumberBg;
      ctx.fillRect(0, rowY, rowNumW, rowH);

      ctx.fillStyle = theme.canvas.rowNumberText;
      ctx.font = `500 ${theme.fontSize - 1}px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(r + 1), rowNumW / 2, rowY + rowH / 2);

      // Kenarlık
      ctx.strokeStyle = theme.canvas.rowNumberBorder;
      ctx.beginPath();
      ctx.moveTo(rowNumW - 0.5, rowY);
      ctx.lineTo(rowNumW - 0.5, rowY + rowH);
      ctx.moveTo(0, rowY + rowH - 0.5);
      ctx.lineTo(rowNumW, rowY + rowH - 0.5);
      ctx.stroke();
    }

    // Frozen sütun ayırıcı gölge çizgisi
    if (geometry.frozenColumns.length > 0) {
      ctx.save();
      ctx.fillStyle = theme.canvas.frozenDividerShadow;
      ctx.fillRect(geometry.totalFrozenWidth, headerH, 3, height - headerH);
      ctx.restore();
    }

    // ========================================================================
    // SEÇİM VE RANGE DİKDÖRTGENİ (SELECTION HIGHLIGHT & FILL HANDLE)
    // ========================================================================
    const norm = selection.getNormalizedRange();
    if (norm.minRow <= endRow && norm.maxRow >= startRow) {
      const topRow = Math.max(startRow, norm.minRow);
      const btmRow = Math.min(endRow, norm.maxRow);

      const rTopY = headerH + norm.minRow * rowH - scrollTop;
      const rHeight = (norm.maxRow - norm.minRow + 1) * rowH;

      const leftColRect = geometry.getColumnScreenRect(norm.minCol, scrollLeft);
      const rightColRect = geometry.getColumnScreenRect(norm.maxCol, scrollLeft);

      if (leftColRect && rightColRect) {
        const rLeftX = leftColRect.x;
        const rWidth = rightColRect.x + rightColRect.width - leftColRect.x;

        ctx.save();
        // Seçim Alanı Dolgusu (Yarı saydam)
        ctx.fillStyle = theme.canvas.selectionFill;
        ctx.fillRect(rLeftX, rTopY, rWidth, rHeight);

        // Seçim Alanı Dış Çerçevesi
        ctx.strokeStyle = theme.canvas.selectionBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(rLeftX, rTopY, rWidth, rHeight);

        // SAĞ ALT DOLDURMA TUTAMACI (FILL HANDLE)
        const fhSize = 6;
        const fhX = rLeftX + rWidth - fhSize / 2;
        const fhY = rTopY + rHeight - fhSize / 2;
        ctx.fillStyle = theme.canvas.fillHandleColor;
        ctx.fillRect(fhX, fhY, fhSize, fhSize);

        ctx.restore();
      }
    }

    // ========================================================================
    // SÜTUN BAŞLIKLARI (HEADER ROW - EN ÜSTTE SABİT)
    // ========================================================================
    this.renderHeaders(ctx, geometry, theme, scrollLeft, width, headerH, rowNumW, sortRules);

    ctx.restore();
  }

  private static renderHeaders(
    ctx: CanvasRenderingContext2D,
    geometry: GeometryEngine,
    theme: IGridThemeTokens,
    scrollLeft: number,
    width: number,
    headerH: number,
    rowNumW: number,
    sortRules: SortDescriptor[]
  ): void {
    // 1. SCROLLABLE BAŞLIKLAR
    ctx.save();
    ctx.beginPath();
    ctx.rect(geometry.totalFrozenWidth, 0, width - geometry.totalFrozenWidth, headerH);
    ctx.clip();

    ctx.fillStyle = theme.canvas.headerBg;
    ctx.fillRect(geometry.totalFrozenWidth, 0, width - geometry.totalFrozenWidth, headerH);

    for (let i = 0; i < geometry.scrollableColumns.length; i++) {
      const col = geometry.scrollableColumns[i];
      const colIdx = geometry.frozenColumns.length + i;
      const x = geometry.totalFrozenWidth + geometry.scrollableColOffsets[i] - scrollLeft;
      this.renderSingleHeader(ctx, col, colIdx, x, 0, col.width, headerH, theme, sortRules);
    }
    ctx.restore();

    // 2. FROZEN BAŞLIKLAR
    let curX = rowNumW;
    for (let i = 0; i < geometry.frozenColumns.length; i++) {
      const col = geometry.frozenColumns[i];
      ctx.fillStyle = theme.canvas.headerBg;
      ctx.fillRect(curX, 0, col.width, headerH);
      this.renderSingleHeader(ctx, col, i, curX, 0, col.width, headerH, theme, sortRules);
      curX += col.width;
    }

    // 3. SOL ÜST KÖŞE (Select All Kutusu)
    ctx.fillStyle = theme.canvas.rowNumberBg;
    ctx.fillRect(0, 0, rowNumW, headerH);
    ctx.strokeStyle = theme.canvas.headerBorder;
    ctx.strokeRect(0, 0, rowNumW, headerH);

    // Frozen başlık gölge çizgisi
    if (geometry.frozenColumns.length > 0) {
      ctx.save();
      ctx.fillStyle = theme.canvas.frozenDividerShadow;
      ctx.fillRect(geometry.totalFrozenWidth, 0, 3, headerH);
      ctx.restore();
    }
  }

  private static renderSingleHeader(
    ctx: CanvasRenderingContext2D,
    col: any,
    colIdx: number,
    x: number,
    y: number,
    w: number,
    h: number,
    theme: IGridThemeTokens,
    sortRules: SortDescriptor[]
  ): void {
    ctx.save();

    // Kenarlıklar
    ctx.strokeStyle = theme.canvas.headerBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w - 0.5, y);
    ctx.lineTo(x + w - 0.5, y + h);
    ctx.moveTo(x, y + h - 0.5);
    ctx.lineTo(x + w, y + h - 0.5);
    ctx.stroke();

    // Başlık Metni
    ctx.beginPath();
    ctx.rect(x + 8, y, w - 36, h);
    ctx.clip();

    ctx.fillStyle = theme.canvas.headerText;
    ctx.font = `600 ${theme.headerFontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(col.title, x + 8, y + h / 2);
    ctx.restore();

    // Sıralama Okları (Varsa)
    const sortIndex = sortRules.findIndex((s) => s.selector === col.id);
    if (sortIndex !== -1) {
      const sort = sortRules[sortIndex];
      ctx.save();
      ctx.fillStyle = theme.canvas.selectionBorder;
      ctx.font = `700 10px ${theme.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const arrow = sort.desc ? '▼' : '▲';
      const badge = sortRules.length > 1 ? `${arrow}${sortIndex + 1}` : arrow;
      ctx.fillText(badge, x + w - 20, y + h / 2);
      ctx.restore();
    }

    // Filtre Huni İkonu (Sağ kenarda minik huni)
    ctx.save();
    ctx.fillStyle = theme.isDark ? '#8E8E93' : '#AEAEB2';
    const fx = x + w - 10;
    const fy = y + h / 2;
    ctx.beginPath();
    ctx.moveTo(fx - 4, fy - 3);
    ctx.lineTo(fx + 4, fy - 3);
    ctx.lineTo(fx + 1, fy + 1);
    ctx.lineTo(fx + 1, fy + 4);
    ctx.lineTo(fx - 1, fy + 4);
    ctx.lineTo(fx - 1, fy + 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
