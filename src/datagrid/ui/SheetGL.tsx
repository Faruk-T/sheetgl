import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { ColumnDef, ActiveOverlayState } from '../types/grid';
import { IDataStore } from '../types/store';
import { SortDescriptor } from '../types/filter';
import { GroupDescriptor } from '../types/group';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { ThemeEngine, ThemeInput } from '../theme/ThemeEngine';
import { GeometryEngine } from '../core/GeometryEngine';
import { SelectionModel } from '../core/SelectionModel';
import { HistoryManager } from '../core/HistoryManager';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { DynamicCellEditor } from '../overlays/DynamicCellEditor';
import { HeaderFilterPopover } from '../overlays/HeaderFilterPopover';
import { ToolBar } from './ToolBar';
import { FormulaBar } from './FormulaBar';
import { SummaryFooter } from './SummaryFooter';
import { LocalDataStore } from '../data/LocalDataStore';
import { initDefaultColumnPlugins } from '../columns/initPlugins';
import { ColumnTypeRegistry } from '../columns/ColumnTypeRegistry';
import { LocaleEngine, LocaleInput, IGridLocale } from '../i18n/LocaleEngine';

export interface SheetGLProps {
  dataSource: any[] | IDataStore;
  columns: ColumnDef[];
  theme?: ThemeInput;
  locale?: LocaleInput;
  rowHeight?: number;
  headerHeight?: number;
  initialSort?: SortDescriptor[];
  initialGroups?: GroupDescriptor[];
  onCellChange?: (row: any, columnId: string, value: any) => void;
  style?: React.CSSProperties;
  className?: string;
}

export const SheetGL: React.FC<SheetGLProps> = ({
  dataSource,
  columns: userColumns,
  theme: userTheme = 'apple-light',
  locale: userLocale = 'en',
  rowHeight = 34,
  headerHeight = 38,
  initialSort = [],
  initialGroups = [],
  onCellChange,
  style,
  className,
}) => {
  // 1. Eklentileri Başlat
  useEffect(() => {
    initDefaultColumnPlugins();
  }, []);

  // 2. DataStore Adaptasyonu
  const store = useMemo<IDataStore>(() => {
    if (Array.isArray(dataSource)) {
      return new LocalDataStore({ data: dataSource, keyField: 'id' });
    }
    return dataSource;
  }, [dataSource]);

  // 3. Tema Çözümleme
  const [currentThemeName, setCurrentThemeName] = useState<ThemeInput>(userTheme);
  const [resolvedTheme, setResolvedTheme] = useState<IGridThemeTokens>(() =>
    ThemeEngine.resolve(userTheme)
  );

  useEffect(() => {
    setResolvedTheme(ThemeEngine.resolve(currentThemeName));
    if (currentThemeName === 'system') {
      const unsub = ThemeEngine.watchSystem(() => {
        setResolvedTheme(ThemeEngine.resolve('system'));
      });
      return unsub;
    }
  }, [currentThemeName]);

  // 3b. Dil Çözümleme (i18n)
  const [currentLocale, setCurrentLocale] = useState<IGridLocale>(() =>
    LocaleEngine.resolve(userLocale)
  );

  useEffect(() => {
    if (userLocale) {
      setCurrentLocale(LocaleEngine.resolve(userLocale));
    }
  }, [userLocale]);

  // 4. Çekirdek Motorlar
  const [columns, setColumns] = useState<ColumnDef[]>(userColumns);
  const geometryRef = useRef<GeometryEngine>(
    new GeometryEngine(userColumns, rowHeight, headerHeight)
  );
  const selectionRef = useRef<SelectionModel>(new SelectionModel());
  const historyRef = useRef<HistoryManager>(new HistoryManager(50));

  // Geometri güncelleme
  useEffect(() => {
    geometryRef.current.rowHeight = rowHeight;
    geometryRef.current.headerHeight = headerHeight;
    geometryRef.current.setColumns(columns);
  }, [columns, rowHeight, headerHeight]);

  // 5. State Yönetimi
  const [sortRules, setSortRules] = useState<SortDescriptor[]>(initialSort);
  const [groups, setGroups] = useState<GroupDescriptor[]>(initialGroups);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCellUI, setSelectedCellUI] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlayState | null>(null);
  const [headerFilterState, setHeaderFilterState] = useState<{
    column: ColumnDef;
    rect: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Sütun genişletme (Resize) sürükleme durumu
  const [resizingCol, setResizingCol] = useState<{ colIndex: number; startX: number; initialWidth: number } | null>(null);

  // Scroll pozisyonu referansı
  const scrollPosRef = useRef<{ left: number; top: number }>({ left: 0, top: 0 });

  // DOM Eleman Referansları
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Store olaylarını dinle
  const [, setStoreVersion] = useState<number>(0);
  useEffect(() => {
    const handleLoaded = () => {
      setStoreVersion((v) => v + 1);
      requestRender();
    };
    store.on('loaded', handleLoaded);
    return () => store.off('loaded', handleLoaded);
  }, [store]);

  // 6. 60 FPS Render Döngüsü
  const requestRender = useCallback(() => {
    if (!canvasRef.current) return;
    requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      CanvasRenderer.render({
        canvas: canvasRef.current,
        geometry: geometryRef.current,
        store,
        selection: selectionRef.current,
        theme: resolvedTheme,
        locale: currentLocale,
        scrollLeft: scrollPosRef.current.left,
        scrollTop: scrollPosRef.current.top,
        sortRules,
        searchKeyword,
      });
    });
  }, [store, resolvedTheme, currentLocale, sortRules, searchKeyword]);

  // Boyut, tema veya dil değişimlerinde çiz
  useEffect(() => {
    requestRender();
  }, [requestRender, resolvedTheme, currentLocale]);

  // 7. Sütun Sıralama (Çoklu Shift+Click Destekli)
  const handleHeaderClick = (colIndex: number, isShift: boolean) => {
    const col = geometryRef.current.columns[colIndex];
    if (!col || col.sortable === false) return;

    let nextRules: SortDescriptor[] = [];
    const existingIndex = sortRules.findIndex((s) => s.selector === col.id);

    if (isShift) {
      nextRules = [...sortRules];
      if (existingIndex !== -1) {
        if (!nextRules[existingIndex].desc) {
          nextRules[existingIndex].desc = true;
        } else {
          nextRules.splice(existingIndex, 1);
        }
      } else {
        nextRules.push({ selector: col.id, desc: false });
      }
    } else {
      if (existingIndex !== -1) {
        if (!sortRules[existingIndex].desc) {
          nextRules = [{ selector: col.id, desc: true }];
        } else {
          nextRules = [];
        }
      } else {
        nextRules = [{ selector: col.id, desc: false }];
      }
    }

    setSortRules(nextRules);
    store.setSorting(nextRules);
  };

  // 8. Sütun Boyutlandırma (Resize Mouse Olayları)
  useEffect(() => {
    if (!resizingCol) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizingCol.startX;
      const newWidth = Math.max(40, resizingCol.initialWidth + deltaX);
      setColumns((prev) => {
        const next = [...prev];
        next[resizingCol.colIndex] = { ...next[resizingCol.colIndex], width: newWidth };
        return next;
      });
    };

    const handleMouseUp = () => {
      setResizingCol(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol]);

  // 9. Hücre Seçimini Taşıma
  const moveSelection = (dRow: number, dCol: number, isRangeSelect: boolean = false) => {
    const geom = geometryRef.current;
    const cur = selectionRef.current.activeCell;
    const nextRow = Math.max(0, Math.min(store.getRowCount() - 1, cur.row + dRow));
    const nextCol = Math.max(0, Math.min(geom.columns.length - 1, cur.col + dCol));

    if (isRangeSelect) {
      selectionRef.current.setRangeEnd(nextRow, nextCol);
    } else {
      selectionRef.current.setActiveCell(nextRow, nextCol);
    }

    setSelectedCellUI({ row: nextRow, col: nextCol });
    ensureCellVisible(nextRow, nextCol);
    requestRender();
  };

  // Görünür alana kaydırma (Auto-scroll into view)
  const ensureCellVisible = (row: number, col: number) => {
    const geom = geometryRef.current;
    const sc = scrollContainerRef.current;
    if (!sc) return;

    const cellTop = geom.headerHeight + row * geom.rowHeight;
    const cellBottom = cellTop + geom.rowHeight;

    if (cellTop < sc.scrollTop + geom.headerHeight) {
      sc.scrollTop = cellTop - geom.headerHeight;
    } else if (cellBottom > sc.scrollTop + sc.clientHeight) {
      sc.scrollTop = cellBottom - sc.clientHeight;
    }

    const colRect = geom.getColumnScreenRect(col, sc.scrollLeft);
    if (!colRect.isFrozen) {
      if (colRect.x < geom.totalFrozenWidth) {
        sc.scrollLeft -= geom.totalFrozenWidth - colRect.x;
      } else if (colRect.x + colRect.width > sc.clientWidth) {
        sc.scrollLeft += colRect.x + colRect.width - sc.clientWidth;
      }
    }
  };

  // 10. Editör Açma (Micro-DOM Overlay)
  const openEditorForCell = (row: number, col: number, initialChar?: string) => {
    const geom = geometryRef.current;
    const colDef = geom.columns[col];
    if (colDef.readonly) return;

    const plugin = ColumnTypeRegistry.get(colDef.type);
    if (!plugin.editorComponent) return; // Zero-DOM eklentiler (Boolean, Rating vb.)

    const screenRect = geom.getColumnScreenRect(col, scrollPosRef.current.left);
    const y = geom.headerHeight + row * geom.rowHeight - scrollPosRef.current.top;

    const vRow = store.getViewRow(row);
    if (!vRow || vRow.type === 'group') return;

    setActiveOverlay({
      row,
      col,
      x: screenRect.x,
      y,
      width: screenRect.width,
      height: geom.rowHeight,
      column: colDef,
      initialValue: vRow.data[colDef.id],
      initialChar,
    });
  };

  // 11. Fare Etkileşimleri
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeOverlay) setActiveOverlay(null);
    if (headerFilterState) setHeaderFilterState(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // A. Sütun Boyutlandırma Sınır Kontrolü
    const resizeHit = geometryRef.current.hitTestColumnResize(x, y, scrollPosRef.current.left);
    if (resizeHit) {
      const col = geometryRef.current.columns[resizeHit.colIndex];
      setResizingCol({
        colIndex: resizeHit.colIndex,
        startX: e.clientX,
        initialWidth: col.width,
      });
      return;
    }

    // B. Başlık Tıklaması (Sıralama veya Filtre Hunisi)
    if (y <= geometryRef.current.headerHeight && x > geometryRef.current.rowNumberWidth) {
      let clickedCol = -1;
      let headerX = 0;
      let headerW = 0;

      // Frozen
      let curX = geometryRef.current.rowNumberWidth;
      for (let i = 0; i < geometryRef.current.frozenColumns.length; i++) {
        const w = geometryRef.current.frozenColumns[i].width;
        if (x >= curX && x < curX + w) {
          clickedCol = i;
          headerX = curX;
          headerW = w;
          break;
        }
        curX += w;
      }

      // Scrollable
      if (clickedCol === -1 && x >= geometryRef.current.totalFrozenWidth) {
        const sx = x - geometryRef.current.totalFrozenWidth + scrollPosRef.current.left;
        const sIdx = geometryRef.current.findScrollableColIndexAtX(sx);
        clickedCol = geometryRef.current.frozenColumns.length + sIdx;
        headerX = geometryRef.current.totalFrozenWidth + geometryRef.current.scrollableColOffsets[sIdx] - scrollPosRef.current.left;
        headerW = geometryRef.current.scrollableColumns[sIdx]?.width || 100;
      }

      if (clickedCol !== -1) {
        const colDef = geometryRef.current.columns[clickedCol];
        // Eğer sağdaki huni ikonuna tıklandıysa popover aç
        if (x >= headerX + headerW - 24) {
          setHeaderFilterState({
            column: colDef,
            rect: { x: headerX, y: 0, width: headerW, height: geometryRef.current.headerHeight },
          });
        } else {
          // Sıralama
          handleHeaderClick(clickedCol, e.shiftKey);
        }
      }
      return;
    }

    // C. Hücre Tıklaması (Hit-Test)
    const hit = geometryRef.current.hitTest(
      x,
      y,
      scrollPosRef.current.left,
      scrollPosRef.current.top,
      store.getRowCount()
    );
    if (!hit) return;

    const vRow = store.getViewRow(hit.row);
    // Grup Satırı Tıklaması (Aç / Kapat)
    if (vRow && vRow.type === 'group') {
      store.toggleGroup(vRow.groupKey);
      return;
    }

    selectionRef.current.setActiveCell(hit.row, hit.col);
    setSelectedCellUI({ row: hit.row, col: hit.col });

    const colDef = geometryRef.current.columns[hit.col];
    const plugin = ColumnTypeRegistry.get(colDef.type);

    if (plugin.onPointerDown && vRow && vRow.type === 'data') {
      const res = plugin.onPointerDown({
        localX: hit.localX,
        localY: hit.localY,
        value: vRow.data[colDef.id],
        column: colDef,
        setValue: (newVal) => {
          store.setCell(vRow.data.id ?? hit.row, colDef.id, newVal);
          onCellChange?.(vRow.data, colDef.id, newVal);
        },
      });

      if (res.shouldOpenEditor) {
        setTimeout(() => openEditorForCell(hit.row, hit.col), 0);
      }
    }

    requestRender();
    containerRef.current?.focus();
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = geometryRef.current.hitTest(
      x,
      y,
      scrollPosRef.current.left,
      scrollPosRef.current.top,
      store.getRowCount()
    );
    if (!hit) return;

    openEditorForCell(hit.row, hit.col);
  };

  // 12. Klavye Navigasyonu
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (activeOverlay) return;

    const { row, col } = selectionRef.current.activeCell;
    const colDef = geometryRef.current.columns[col];
    const vRow = store.getViewRow(row);

    // Eklentiye özel tuş dinleyicisi (Space toggle, 1-5 rating vb.)
    if (colDef && vRow && vRow.type === 'data') {
      const plugin = ColumnTypeRegistry.get(colDef.type);
      if (plugin.onKeyDown) {
        const handled = plugin.onKeyDown({
          event: e,
          value: vRow.data[colDef.id],
          column: colDef,
          setValue: (newVal) => {
            store.setCell(vRow.data.id ?? row, colDef.id, newVal);
            onCellChange?.(vRow.data, colDef.id, newVal);
            requestRender();
          },
          openEditor: (char) => openEditorForCell(row, col, char),
        });
        if (handled) return;
      }
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveSelection(-1, 0, e.shiftKey);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveSelection(1, 0, e.shiftKey);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        moveSelection(0, -1, e.shiftKey);
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveSelection(0, 1, e.shiftKey);
        break;
      case 'Tab':
        e.preventDefault();
        moveSelection(0, e.shiftKey ? -1 : 1);
        break;
      case 'Enter':
        e.preventDefault();
        openEditorForCell(row, col);
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        if (colDef && !colDef.readonly && vRow && vRow.type === 'data') {
          store.setCell(vRow.data.id ?? row, colDef.id, null);
          onCellChange?.(vRow.data, colDef.id, null);
          requestRender();
        }
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.shiftKey) historyRef.current.redo();
          else historyRef.current.undo();
          requestRender();
        }
        break;
      case 'y':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          historyRef.current.redo();
          requestRender();
        }
        break;
    }
  };

  // 13. TSV Pano Kopyalama (Ctrl+C)
  const handleCopy = (e: React.ClipboardEvent) => {
    if (activeOverlay) return;
    e.preventDefault();

    const norm = selectionRef.current.getNormalizedRange();
    const rowsText: string[] = [];

    for (let r = norm.minRow; r <= norm.maxRow; r++) {
      const vRow = store.getViewRow(r);
      if (!vRow || vRow.type === 'group') continue;

      const cellsText: string[] = [];
      for (let c = norm.minCol; c <= norm.maxCol; c++) {
        const colDef = geometryRef.current.columns[c];
        const val = vRow.data[colDef.id];
        const plugin = ColumnTypeRegistry.get(colDef.type);
        const formatted = plugin.formatClipboard ? plugin.formatClipboard(val, colDef) : String(val ?? '');
        cellsText.push(formatted);
      }
      rowsText.push(cellsText.join('\t'));
    }

    e.clipboardData.setData('text/plain', rowsText.join('\n'));
  };

  // 14. TSV Pano Yapıştırma (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (activeOverlay) return;
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    e.preventDefault();

    const lines = text.replace(/\r/g, '').split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    const startRow = selectionRef.current.activeCell.row;
    const startCol = selectionRef.current.activeCell.col;

    lines.forEach((line, rOffset) => {
      const targetRow = startRow + rOffset;
      if (targetRow >= store.getRowCount()) return;

      const vRow = store.getViewRow(targetRow);
      if (!vRow || vRow.type === 'group') return;

      const cells = line.split('\t');
      cells.forEach((cellText, cOffset) => {
        const targetCol = startCol + cOffset;
        if (targetCol >= geometryRef.current.columns.length) return;

        const colDef = geometryRef.current.columns[targetCol];
        if (colDef.readonly) return;

        const plugin = ColumnTypeRegistry.get(colDef.type);
        const parsedVal = plugin.parseClipboard ? plugin.parseClipboard(cellText, colDef) : cellText.trim();

        store.setCell(vRow.data.id ?? targetRow, colDef.id, parsedVal);
        onCellChange?.(vRow.data, colDef.id, parsedVal);
      });
    });

    requestRender();
  };

  // 15. CSV İndirme
  const exportCsv = () => {
    const cols = geometryRef.current.columns;
    const headerRow = cols.map((c) => `"${c.title.replace(/"/g, '""')}"`).join(',');
    const rows: string[] = [headerRow];

    for (let r = 0; r < store.getRowCount(); r++) {
      const vRow = store.getViewRow(r);
      if (!vRow || vRow.type === 'group') continue;

      const cellVals = cols.map((c) => {
        const val = vRow.data[c.id];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      });
      rows.push(cellVals.join(','));
    }

    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aktif Hücre Değeri & Sütun
  const currentColumn = geometryRef.current.columns[selectedCellUI.col];
  const activeViewRow = store.getViewRow(selectedCellUI.row);
  const currentCellValue =
    activeViewRow && activeViewRow.type === 'data' && currentColumn
      ? activeViewRow.data[currentColumn.id]
      : '';

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onCopy={handleCopy}
      onPaste={handlePaste}
      className={`sheetgl-container ${className || ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        outline: 'none',
        backgroundColor: resolvedTheme.canvas.bg,
        color: resolvedTheme.canvas.cellText,
        fontFamily: resolvedTheme.fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {/* 1. ÜST ARAÇ ÇUBUĞU */}
      <ToolBar
        rowCount={store.getRowCount()}
        columnCount={columns.length}
        theme={resolvedTheme}
        locale={currentLocale}
        currentThemeName={typeof currentThemeName === 'string' ? currentThemeName : 'custom'}
        onThemeChange={setCurrentThemeName}
        onLocaleChange={(code) => setCurrentLocale(LocaleEngine.resolve(code))}
        searchKeyword={searchKeyword}
        onSearchChange={(k) => {
          setSearchKeyword(k);
          store.setSearch(k);
        }}
        onExportCsv={exportCsv}
        groups={groups.map((g) => g.selector)}
        onToggleGroupColumn={(colId) => {
          const exists = groups.some((g) => g.selector === colId);
          const nextGroups = exists
            ? groups.filter((g) => g.selector !== colId)
            : [...groups, { selector: colId }];
          setGroups(nextGroups);
          store.setGrouping(nextGroups);
        }}
        availableColumns={columns.map((c) => ({ id: c.id, title: c.title }))}
      />

      {/* 2. FORMÜL & KOORDİNAT ÇUBUĞU */}
      <FormulaBar
        activeCoords={selectedCellUI}
        column={currentColumn}
        currentValue={currentCellValue}
        theme={resolvedTheme}
      />

      {/* 3. ANA GRID YÜZEYİ (CANVAS + SANAL SCROLLBAR + DOM OVERLAYS) */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {/* Fiziksel Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* Sanal Kaydırma Çubuğu & Tıklama Katmanı */}
        <div
          ref={scrollContainerRef}
          onScroll={(e) => {
            const target = e.currentTarget;
            scrollPosRef.current = {
              left: target.scrollLeft,
              top: target.scrollTop,
            };
            if (activeOverlay) setActiveOverlay(null);
            if (headerFilterState) setHeaderFilterState(null);
            requestRender();
          }}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'auto',
            zIndex: 20,
          }}
        >
          {/* Toplam Sanal Boyutu Oluşturan Boş Alan */}
          <div
            onMouseDown={handleCanvasMouseDown}
            onDoubleClick={handleCanvasDoubleClick}
            style={{
              width: geometryRef.current.totalFrozenWidth + geometryRef.current.totalScrollableWidth,
              height:
                geometryRef.current.headerHeight +
                store.getRowCount() * geometryRef.current.rowHeight,
              cursor: resizingCol ? 'col-resize' : 'cell',
            }}
          />
        </div>

        {/* 4. DİNAMİK MICRO-DOM HÜCRE EDİTÖRÜ */}
        {activeOverlay && (
          <DynamicCellEditor
            overlay={activeOverlay}
            theme={resolvedTheme}
            locale={currentLocale}
            onCommit={(newVal, moveDir) => {
              const vRow = store.getViewRow(activeOverlay.row);
              if (vRow && vRow.type === 'data') {
                store.setCell(vRow.data.id ?? activeOverlay.row, activeOverlay.column.id, newVal);
                onCellChange?.(vRow.data, activeOverlay.column.id, newVal);
              }
              setActiveOverlay(null);
              if (moveDir === 'down') moveSelection(1, 0);
              else if (moveDir === 'right') moveSelection(0, 1);
              else if (moveDir === 'left') moveSelection(0, -1);
              else requestRender();
              containerRef.current?.focus();
            }}
            onCancel={() => {
              setActiveOverlay(null);
              containerRef.current?.focus();
            }}
          />
        )}

        {/* 5. EXCEL TARZI BAŞLIK FİLTRE POPOVER'I */}
        {headerFilterState && (
          <HeaderFilterPopover
            column={headerFilterState.column}
            anchorRect={headerFilterState.rect}
            theme={resolvedTheme}
            locale={currentLocale}
            store={store}
            onApply={(selectedVals) => {
              if (selectedVals) {
                store.setFilter([headerFilterState.column.id, 'in', selectedVals]);
              } else {
                store.setFilter(null);
              }
              setHeaderFilterState(null);
            }}
            onClose={() => setHeaderFilterState(null)}
          />
        )}
      </div>

      {/* 6. ALT TOPLAM VE ÖZET ŞERİDİ */}
      <SummaryFooter
        summaries={store.getSummaries()}
        columns={columns}
        theme={resolvedTheme}
        locale={currentLocale}
        totalRowCount={store.getRowCount()}
      />
    </div>
  );
};
