import { GeometryEngine } from '../core/GeometryEngine';
import { SelectionModel } from '../core/SelectionModel';
import { IDataStore } from '../types/store';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { ColumnTypeRegistry } from '../columns/ColumnTypeRegistry';
import { GroupRowPainter } from './GroupRowPainter';
import { SkeletonPainter } from './SkeletonPainter';
import { SortDescriptor } from '../types/filter';
import { IGridLocale } from '../i18n/IGridLocale';
import { ColumnDef, GridPermissions } from '../types/grid';

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
  hoveredFilterColIndex?: number | null;
  activeFilterColumnIds?: Set<string>;
  fillDragRange?: { minRow: number; maxRow: number; minCol: number; maxCol: number } | null;
  loadingRowKeys?: Set<any>;
  permissions?: GridPermissions;
}

export class CanvasRenderer {
  public static isColumnReadonly(col: ColumnDef, permissions?: GridPermissions): boolean {
    if (permissions?.mode === 'read' || permissions?.mode === 'readonly') return true;
    if (permissions?.allowUpdating === false) return true;
    if (col.readonly || col.permission === 'readonly' || col.permission === 'read') return true;
    return false;
  }

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
      hoveredFilterColIndex,
      activeFilterColumnIds,
      fillDragRange,
      loadingRowKeys,
      permissions,
    } = params;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width) || canvas.clientWidth || 0;
    const height = Math.round(rect.height) || canvas.clientHeight || 0;

    if (width <= 0 || height <= 0) return;

    const targetPixelWidth = Math.round(width * dpr);
    const targetPixelHeight = Math.round(height * dpr);

    if (canvas.width !== targetPixelWidth || canvas.height !== targetPixelHeight) {
      canvas.width = targetPixelWidth;
      canvas.height = targetPixelHeight;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save();
    ctx.scale(dpr, dpr);

    try {
      // 1. Background Fill
      ctx.fillStyle = theme.canvas.bg;
      ctx.fillRect(0, 0, width, height);

      const rowCount = store.getRowCount();
      const rowH = geometry.rowHeight;
      const headerH = geometry.headerHeight;
      const rowNumW = geometry.rowNumberWidth;

      // 2. Viewport Row Bounds
      const startRow = Math.max(0, Math.floor(scrollTop / rowH));
      const endRow = Math.min(rowCount - 1, Math.ceil((scrollTop + height - headerH) / rowH));

      if (rowCount > 0 && endRow >= startRow) {
        store.ensureRange(startRow, endRow);
      }

      // 3. Viewport Scrollable Column Bounds
      let startScrollColIdx = 0;
      let endScrollColIdx = geometry.scrollableColumns.length - 1;

      if (geometry.scrollableColumns.length > 0) {
        startScrollColIdx = geometry.findScrollableColIndexAtX(scrollLeft);
        endScrollColIdx = geometry.findScrollableColIndexAtX(
          scrollLeft + Math.max(0, width - geometry.totalFrozenWidth)
        );
      }

      const normSel = selection.getNormalizedRange();

      // ========================================================================
      // DATA ROWS & CELLS
      // ========================================================================
      for (let r = startRow; r <= endRow; r++) {
        const rowY = headerH + r * rowH - scrollTop;
        const vRow = store.getViewRow(r);

        if (!vRow) {
          SkeletonPainter.paintSkeletonCell(ctx, rowNumW, rowY, width - rowNumW, rowH, theme);
          continue;
        }

        if (vRow.type === 'group') {
          GroupRowPainter.paintGroupRow(
            ctx,
            vRow,
            rowY,
            width,
            rowH,
            theme,
            locale,
            geometry.columns,
            hoveredCell?.row === r
          );
          continue;
        }

        const rowData = vRow.data;
        const rowKey = rowData.id ?? r;
        const isRowInserted = store.isRowInserted?.(rowKey) ?? false;
        const isRowLoading = loadingRowKeys?.has(rowKey) ?? false;
        const isRowInActiveSel = r >= normSel.minRow && r <= normSel.maxRow;

        // 1. SCROLLABLE COLUMNS
        ctx.save();
        ctx.beginPath();
        ctx.rect(
          geometry.totalFrozenWidth,
          headerH,
          Math.max(0, width - geometry.totalFrozenWidth),
          Math.max(0, height - headerH)
        );
        ctx.clip();

        for (let sc = startScrollColIdx; sc <= endScrollColIdx; sc++) {
          const colIdx = geometry.frozenColumns.length + sc;
          const col = geometry.columns[colIdx];
          if (!col) continue;

          const cellX = geometry.totalFrozenWidth + geometry.scrollableColOffsets[sc] - scrollLeft;
          this.renderCell(
            ctx,
            rowData,
            rowKey,
            r,
            col,
            colIdx,
            cellX,
            rowY,
            col.width,
            rowH,
            theme,
            locale,
            selection,
            store,
            hoveredCell,
            searchKeyword,
            isRowInserted,
            isRowLoading,
            permissions
          );
        }
        ctx.restore();

        // 2. FROZEN COLUMNS
        let curFrozenX = rowNumW;
        for (let fc = 0; fc < geometry.frozenColumns.length; fc++) {
          const col = geometry.frozenColumns[fc];
          ctx.fillStyle = theme.canvas.bg;
          ctx.fillRect(curFrozenX, rowY, col.width, rowH);

          this.renderCell(
            ctx,
            rowData,
            rowKey,
            r,
            col,
            fc,
            curFrozenX,
            rowY,
            col.width,
            rowH,
            theme,
            locale,
            selection,
            store,
            hoveredCell,
            searchKeyword,
            isRowInserted,
            isRowLoading,
            permissions
          );

          curFrozenX += col.width;
        }

        // 3. ROW NUMBER GUTTER (Leftmost)
        ctx.fillStyle = isRowInActiveSel
          ? theme.isDark
            ? 'rgba(10, 132, 255, 0.22)'
            : 'rgba(0, 122, 255, 0.12)'
          : theme.canvas.rowNumberBg;
        ctx.fillRect(0, rowY, rowNumW, rowH);

        // Inserted row left indicator bar
        if (isRowInserted) {
          ctx.fillStyle = '#30D158';
          ctx.fillRect(0, rowY, 4, rowH);
        } else if (isRowLoading) {
          ctx.fillStyle = '#FF9F0A';
          ctx.fillRect(0, rowY, 4, rowH);
        }

        ctx.fillStyle = isRowInActiveSel ? theme.dom.accentColor : theme.canvas.rowNumberText;
        ctx.font = `${isRowInActiveSel ? '700' : '500'} ${theme.fontSize - 1}px ${theme.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isRowLoading ? '⟳' : String(r + 1), rowNumW / 2, rowY + rowH / 2);

        // Row number border
        ctx.strokeStyle = theme.canvas.rowNumberBorder;
        ctx.beginPath();
        ctx.moveTo(rowNumW - 0.5, rowY);
        ctx.lineTo(rowNumW - 0.5, rowY + rowH);
        ctx.moveTo(0, rowY + rowH - 0.5);
        ctx.lineTo(rowNumW, rowY + rowH - 0.5);
        ctx.stroke();
      }

      // Frozen column divider shadow
      if (geometry.frozenColumns.length > 0) {
        ctx.save();
        ctx.fillStyle = theme.canvas.frozenDividerShadow;
        ctx.fillRect(geometry.totalFrozenWidth, headerH, 3, height - headerH);
        ctx.restore();
      }

      // ========================================================================
      // FILL HANDLE DRAG PREVIEW RECTANGLE (Excel AutoFill Dashed Box)
      // ========================================================================
      if (fillDragRange && rowCount > 0) {
        const fTopY = headerH + fillDragRange.minRow * rowH - scrollTop;
        const fHeight = (fillDragRange.maxRow - fillDragRange.minRow + 1) * rowH;
        const fLeftRect = geometry.getColumnScreenRect(fillDragRange.minCol, scrollLeft);
        const fRightRect = geometry.getColumnScreenRect(fillDragRange.maxCol, scrollLeft);

        if (fLeftRect && fRightRect) {
          const fLeftX = fLeftRect.x;
          const fWidth = fRightRect.x + fRightRect.width - fLeftRect.x;

          ctx.save();
          ctx.beginPath();
          ctx.rect(rowNumW, headerH, width - rowNumW, height - headerH);
          ctx.clip();

          ctx.fillStyle = theme.isDark ? 'rgba(48, 209, 88, 0.14)' : 'rgba(52, 199, 89, 0.12)';
          ctx.fillRect(fLeftX, fTopY, fWidth, fHeight);

          ctx.strokeStyle = theme.isDark ? '#30D158' : '#28CD41';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(fLeftX, fTopY, fWidth, fHeight);
          ctx.restore();
        }
      }

      // ========================================================================
      // SELECTION HIGHLIGHT, CORNER FILL HANDLE & RIGHT DUPLICATE HANDLE
      // ========================================================================
      const activeViewRowForSel = store.getViewRow(normSel.minRow);
      const isSingleGroupRowSelected =
        normSel.minRow === normSel.maxRow && activeViewRowForSel?.type === 'group';

      if (
        !isSingleGroupRowSelected &&
        rowCount > 0 &&
        normSel.minRow <= endRow &&
        normSel.maxRow >= startRow
      ) {
        const rTopY = headerH + normSel.minRow * rowH - scrollTop;
        const rHeight = (normSel.maxRow - normSel.minRow + 1) * rowH;

        const leftColRect = geometry.getColumnScreenRect(normSel.minCol, scrollLeft);
        const rightColRect = geometry.getColumnScreenRect(normSel.maxCol, scrollLeft);

        if (leftColRect && rightColRect) {
          const rLeftX = leftColRect.x;
          const rWidth = rightColRect.x + rightColRect.width - leftColRect.x;

          ctx.save();
          ctx.beginPath();
          ctx.rect(rowNumW, headerH, width - rowNumW, height - headerH);
          ctx.clip();

          // Selection translucent fill
          ctx.fillStyle = theme.canvas.selectionFill;
          ctx.fillRect(rLeftX, rTopY, rWidth, rHeight);

          // Selection border
          ctx.strokeStyle = theme.canvas.selectionBorder;
          ctx.lineWidth = 2;
          ctx.strokeRect(rLeftX, rTopY, rWidth, rHeight);

          const activeColDef = geometry.columns[normSel.maxCol];
          const isSpecialNonDuplicatable =
            !activeColDef ||
            activeColDef.type === 'sparkline' ||
            activeColDef.type === 'action' ||
            this.isColumnReadonly(activeColDef, permissions);

          const canDuplicate =
            !isSpecialNonDuplicatable &&
            permissions?.mode !== 'read' &&
            permissions?.mode !== 'readonly' &&
            permissions?.allowUpdating !== false &&
            permissions?.allowDuplicating !== false;

          if (canDuplicate) {
            // 1. Bottom-Right Corner Fill Handle (Excel Square)
            const fhSize = 8;
            const fhX = rLeftX + rWidth - fhSize / 2;
            const fhY = rTopY + rHeight - fhSize / 2;
            ctx.fillStyle = theme.canvas.fillHandleColor;
            ctx.fillRect(fhX, fhY, fhSize, fhSize);
            ctx.strokeStyle = theme.canvas.bg;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(fhX, fhY, fhSize, fhSize);

            // 2. Right-Side Quick Cell Duplicate Handle ("+" pill on right edge)
            const dupSize = 14;
            const dupX = rLeftX + rWidth - dupSize / 2;
            const dupY = rTopY + rHeight / 2 - dupSize / 2;

            ctx.fillStyle = theme.dom.accentColor;
            ctx.beginPath();
            ctx.roundRect(dupX, dupY, dupSize, dupSize, 4);
            ctx.fill();

            ctx.strokeStyle = theme.canvas.bg;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Draw tiny '+' inside the right duplicate handle
            const cx = dupX + dupSize / 2;
            const cy = dupY + dupSize / 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy);
            ctx.lineTo(cx + 3, cy);
            ctx.moveTo(cx, cy - 3);
            ctx.lineTo(cx, cy + 3);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // ========================================================================
      // COLUMN HEADERS (FIXED AT TOP)
      // ========================================================================
      this.renderHeaders(
        ctx,
        geometry,
        store,
        theme,
        scrollLeft,
        width,
        headerH,
        rowNumW,
        sortRules,
        normSel,
        hoveredFilterColIndex,
        activeFilterColumnIds,
        permissions
      );
    } finally {
      ctx.restore();
    }
  }

  private static renderCell(
    ctx: CanvasRenderingContext2D,
    rowData: Record<string, any>,
    rowKey: any,
    rowIndex: number,
    col: ColumnDef,
    colIdx: number,
    cellX: number,
    rowY: number,
    colW: number,
    rowH: number,
    theme: IGridThemeTokens,
    locale: IGridLocale,
    selection: SelectionModel,
    store: IDataStore,
    hoveredCell?: { row: number; col: number } | null,
    searchKeyword?: string,
    isRowInserted?: boolean,
    isRowLoading?: boolean,
    permissions?: GridPermissions
  ): void {
    const cellVal = rowData[col.id];
    const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIdx;
    const isReadonly =
      this.isColumnReadonly(col, permissions) ||
      (col.canEdit ? !col.canEdit(rowData, col) : false);
    const isDirty = store.isCellDirty?.(rowKey, col.id) ?? false;
    const isColDirty = store.isColumnDirty?.(col.id) ?? false;

    // DevExtreme-style background for dirty cells (dx-cell-modified), dirty columns, inserted rows, loading, or readonly
    if (isRowLoading) {
      ctx.fillStyle = theme.isDark ? 'rgba(255, 159, 10, 0.14)' : 'rgba(255, 149, 0, 0.10)';
      ctx.fillRect(cellX, rowY, colW, rowH);
    } else if (isDirty) {
      // DevExtreme dx-cell-modified distinct green highlight
      ctx.fillStyle = theme.isDark ? 'rgba(34, 197, 94, 0.22)' : 'rgba(22, 163, 74, 0.15)';
      ctx.fillRect(cellX, rowY, colW, rowH);
    } else if (isRowInserted) {
      // DevExtreme dx-row-inserted highlight
      ctx.fillStyle = theme.isDark ? 'rgba(48, 209, 88, 0.10)' : 'rgba(52, 199, 89, 0.08)';
      ctx.fillRect(cellX, rowY, colW, rowH);
    } else if (isColDirty) {
      // Subtle column-wide tint when this column has uncommitted modifications
      ctx.fillStyle = theme.isDark ? 'rgba(34, 197, 94, 0.05)' : 'rgba(22, 163, 74, 0.04)';
      ctx.fillRect(cellX, rowY, colW, rowH);
    } else if (isReadonly && col.type !== 'action' && col.type !== 'sparkline') {
      ctx.fillStyle = theme.isDark ? 'rgba(255, 255, 255, 0.018)' : 'rgba(0, 0, 0, 0.018)';
      ctx.fillRect(cellX, rowY, colW, rowH);
    }

    // Search keyword highlight
    if (
      searchKeyword &&
      cellVal != null &&
      String(cellVal).toLowerCase().includes(searchKeyword.toLowerCase())
    ) {
      ctx.fillStyle = theme.canvas.searchHighlight;
      ctx.fillRect(cellX, rowY, colW, rowH);
    }

    // Column type plugin paint
    const plugin = ColumnTypeRegistry.get(col.type);
    plugin.paint({
      ctx,
      value: cellVal,
      row: rowData,
      rowIndex,
      column: col,
      theme,
      locale,
      x: cellX,
      y: rowY,
      width: colW,
      height: rowH,
      isSelected: selection.isCellSelected(rowIndex, colIdx),
      isHovered,
      isReadonly,
      isDirty,
    });

    // DevExtreme dx-cell-modified Crisp Green Cell Border + Top-Right Triangle Indicator
    if (isDirty) {
      ctx.save();
      const dirtyStroke = theme.isDark ? '#22C55E' : '#16A34A';
      ctx.strokeStyle = dirtyStroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cellX + 0.75, rowY + 0.75, colW - 1.5, rowH - 1.5);

      ctx.fillStyle = dirtyStroke;
      ctx.beginPath();
      ctx.moveTo(cellX + colW - 8, rowY);
      ctx.lineTo(cellX + colW, rowY);
      ctx.lineTo(cellX + colW, rowY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Cell Grid Lines
    ctx.strokeStyle = theme.canvas.gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cellX + colW - 0.5, rowY);
    ctx.lineTo(cellX + colW - 0.5, rowY + rowH);
    ctx.moveTo(cellX, rowY + rowH - 0.5);
    ctx.lineTo(cellX + colW, rowY + rowH - 0.5);
    ctx.stroke();
  }

  private static renderHeaders(
    ctx: CanvasRenderingContext2D,
    geometry: GeometryEngine,
    store: IDataStore,
    theme: IGridThemeTokens,
    scrollLeft: number,
    width: number,
    headerH: number,
    rowNumW: number,
    sortRules: SortDescriptor[],
    normSel: { minRow: number; maxRow: number; minCol: number; maxCol: number },
    hoveredFilterColIndex?: number | null,
    activeFilterColumnIds?: Set<string>,
    permissions?: GridPermissions
  ): void {
    // 1. SCROLLABLE HEADERS
    ctx.save();
    ctx.beginPath();
    ctx.rect(geometry.totalFrozenWidth, 0, Math.max(0, width - geometry.totalFrozenWidth), headerH);
    ctx.clip();

    ctx.fillStyle = theme.canvas.headerBg;
    ctx.fillRect(geometry.totalFrozenWidth, 0, Math.max(0, width - geometry.totalFrozenWidth), headerH);

    for (let i = 0; i < geometry.scrollableColumns.length; i++) {
      const col = geometry.scrollableColumns[i];
      const colIdx = geometry.frozenColumns.length + i;
      const x = geometry.totalFrozenWidth + geometry.scrollableColOffsets[i] - scrollLeft;
      this.renderSingleHeader(
        ctx,
        col,
        colIdx,
        x,
        0,
        col.width,
        headerH,
        theme,
        sortRules,
        colIdx >= normSel.minCol && colIdx <= normSel.maxCol,
        hoveredFilterColIndex === colIdx,
        activeFilterColumnIds?.has(col.id) ?? false,
        store.isColumnDirty?.(col.id) ?? false,
        permissions
      );
    }
    ctx.restore();

    // 2. FROZEN HEADERS
    let curX = rowNumW;
    for (let i = 0; i < geometry.frozenColumns.length; i++) {
      const col = geometry.frozenColumns[i];
      ctx.fillStyle = theme.canvas.headerBg;
      ctx.fillRect(curX, 0, col.width, headerH);
      this.renderSingleHeader(
        ctx,
        col,
        i,
        curX,
        0,
        col.width,
        headerH,
        theme,
        sortRules,
        i >= normSel.minCol && i <= normSel.maxCol,
        hoveredFilterColIndex === i,
        activeFilterColumnIds?.has(col.id) ?? false,
        store.isColumnDirty?.(col.id) ?? false,
        permissions
      );
      curX += col.width;
    }

    // 3. TOP-LEFT CORNER BOX (Select All)
    ctx.fillStyle = theme.canvas.rowNumberBg;
    ctx.fillRect(0, 0, rowNumW, headerH);
    ctx.strokeStyle = theme.canvas.headerBorder;
    ctx.strokeRect(0, 0, rowNumW, headerH);

    // Draw subtle corner triangle in top-left select-all box
    ctx.fillStyle = theme.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.moveTo(rowNumW - 8, headerH - 16);
    ctx.lineTo(rowNumW - 8, headerH - 6);
    ctx.lineTo(rowNumW - 18, headerH - 6);
    ctx.closePath();
    ctx.fill();

    // Frozen header divider shadow
    if (geometry.frozenColumns.length > 0) {
      ctx.save();
      ctx.fillStyle = theme.canvas.frozenDividerShadow;
      ctx.fillRect(geometry.totalFrozenWidth, 0, 3, headerH);
      ctx.restore();
    }
  }

  private static renderSingleHeader(
    ctx: CanvasRenderingContext2D,
    col: ColumnDef,
    colIdx: number,
    x: number,
    y: number,
    w: number,
    h: number,
    theme: IGridThemeTokens,
    sortRules: SortDescriptor[],
    isColSelected: boolean,
    isFilterHovered: boolean,
    isFilterActive: boolean,
    isColumnDirty: boolean,
    permissions?: GridPermissions
  ): void {
    ctx.save();

    if (isColumnDirty) {
      ctx.fillStyle = theme.isDark ? 'rgba(34, 197, 94, 0.16)' : 'rgba(22, 163, 74, 0.12)';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = theme.isDark ? '#22C55E' : '#16A34A';
      ctx.fillRect(x, y, w, 2.5);
    } else if (isColSelected) {
      ctx.fillStyle = theme.isDark ? 'rgba(10, 132, 255, 0.12)' : 'rgba(0, 122, 255, 0.07)';
      ctx.fillRect(x, y, w, h);
    }

    // Borders
    ctx.strokeStyle = theme.canvas.headerBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w - 0.5, y);
    ctx.lineTo(x + w - 0.5, y + h);
    ctx.moveTo(x, y + h - 0.5);
    ctx.lineTo(x + w, y + h - 0.5);
    ctx.stroke();

    // Active column bottom highlight bar
    if (isColSelected) {
      ctx.fillStyle = theme.dom.accentColor;
      ctx.fillRect(x, y + h - 2, w, 2);
    }

    const isReadonly = this.isColumnReadonly(col, permissions);
    const isFilterable =
      col.filterable !== false && col.type !== 'sparkline' && col.type !== 'action';
    const sortIndex = sortRules.findIndex((s) => s.selector === col.id);

    const rightReserved = (isFilterable ? 28 : 8) + (sortIndex !== -1 ? 18 : 0);

    // Header Title + Optional Readonly Lock Icon
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 8, y, Math.max(0, w - rightReserved - 8), h);
    ctx.clip();

    ctx.fillStyle = theme.canvas.headerText;
    ctx.font = `600 ${theme.headerFontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const prefix = isReadonly && col.type !== 'action' && col.type !== 'sparkline' ? '🔒 ' : '';
    ctx.fillText(`${prefix}${col.title}`, x + 8, y + h / 2);
    ctx.restore();

    // Sort Arrow
    if (sortIndex !== -1) {
      const sort = sortRules[sortIndex];
      ctx.save();
      ctx.fillStyle = theme.dom.accentColor;
      ctx.font = `700 10px ${theme.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const arrow = sort.desc ? '▼' : '▲';
      const badge = sortRules.length > 1 ? `${arrow}${sortIndex + 1}` : arrow;
      ctx.fillText(badge, x + w - (isFilterable ? 28 : 8), y + h / 2);
      ctx.restore();
    }

    // Filter Funnel Button (Easy-to-click 22x22 button box)
    if (isFilterable && w >= 48) {
      const btnSize = 20;
      const btnX = x + w - btnSize - 5;
      const btnY = y + (h - btnSize) / 2;

      ctx.save();
      if (isFilterActive) {
        ctx.fillStyle = theme.dom.accentColor;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnSize, btnSize, 5);
        ctx.fill();
      } else if (isFilterHovered) {
        ctx.fillStyle = theme.isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnSize, btnSize, 5);
        ctx.fill();
      }

      const fx = btnX + btnSize / 2;
      const fy = btnY + btnSize / 2;
      ctx.fillStyle = isFilterActive
        ? '#FFFFFF'
        : isFilterHovered
        ? theme.canvas.headerText
        : theme.isDark
        ? '#98989D'
        : '#8E8E93';

      ctx.beginPath();
      ctx.moveTo(fx - 5, fy - 4);
      ctx.lineTo(fx + 5, fy - 4);
      ctx.lineTo(fx + 1.5, fy + 0.5);
      ctx.lineTo(fx + 1.5, fy + 4.5);
      ctx.lineTo(fx - 1.5, fy + 3.5);
      ctx.lineTo(fx - 1.5, fy + 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
