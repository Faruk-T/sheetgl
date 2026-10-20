import { ColumnDef } from '../types/grid';
import { SelectionModel } from './SelectionModel';

export interface HitTestResult {
  row: number;
  col: number;
  localX: number;
  localY: number;
  isFrozen: boolean;
  cellRect: { x: number; y: number; width: number; height: number };
}

export interface HeaderHitTestResult {
  colIndex: number;
  column: ColumnDef;
  headerX: number;
  headerWidth: number;
  isFilterIconHit: boolean;
}

export class GeometryEngine {
  public rowHeight: number = 34;
  public headerHeight: number = 38;
  public rowNumberWidth: number = 54;

  public columns: ColumnDef[] = [];
  public frozenColumns: ColumnDef[] = [];
  public scrollableColumns: ColumnDef[] = [];
  public totalFrozenWidth: number = 0;
  public totalScrollableWidth: number = 0;
  public scrollableColOffsets: Float32Array = new Float32Array(0);

  constructor(columns: ColumnDef[] = [], rowHeight: number = 34, headerHeight: number = 38) {
    this.rowHeight = rowHeight;
    this.headerHeight = headerHeight;
    this.setColumns(columns);
  }

  public setColumns(columns: ColumnDef[]): void {
    const visibleCols = columns.filter((c) => c.visible !== false);
    this.columns = [
      ...visibleCols.filter((c) => Boolean(c.pinned)),
      ...visibleCols.filter((c) => !c.pinned),
    ];
    this.recalculateGeometry();
  }

  public recalculateGeometry(): void {
    this.frozenColumns = this.columns.filter((c) => Boolean(c.pinned));
    this.scrollableColumns = this.columns.filter((c) => !c.pinned);

    this.totalFrozenWidth =
      this.rowNumberWidth + this.frozenColumns.reduce((sum, c) => sum + c.width, 0);

    this.scrollableColOffsets = new Float32Array(this.scrollableColumns.length + 1);
    let acc = 0;
    for (let i = 0; i < this.scrollableColumns.length; i++) {
      this.scrollableColOffsets[i] = acc;
      acc += this.scrollableColumns[i].width;
    }
    this.scrollableColOffsets[this.scrollableColumns.length] = acc;
    this.totalScrollableWidth = acc;
  }

  public findScrollableColIndexAtX(scrollX: number): number {
    let low = 0;
    let high = this.scrollableColumns.length - 1;
    while (low <= high) {
      const mid = (low + high) >>> 1;
      const start = this.scrollableColOffsets[mid];
      const end = this.scrollableColOffsets[mid + 1];
      if (scrollX >= start && scrollX < end) {
        return mid;
      } else if (scrollX < start) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return Math.min(Math.max(0, low), Math.max(0, this.scrollableColumns.length - 1));
  }

  public getColumnScreenRect(
    colIndex: number,
    scrollLeft: number
  ): { x: number; width: number; isFrozen: boolean } {
    const frozenCount = this.frozenColumns.length;
    if (colIndex < frozenCount) {
      let x = this.rowNumberWidth;
      for (let i = 0; i < colIndex; i++) {
        x += this.frozenColumns[i].width;
      }
      return {
        x,
        width: this.frozenColumns[colIndex]?.width || 0,
        isFrozen: true,
      };
    } else {
      const scrollIdx = colIndex - frozenCount;
      if (scrollIdx < 0 || scrollIdx >= this.scrollableColumns.length) {
        return { x: 0, width: 0, isFrozen: false };
      }
      const x = this.totalFrozenWidth + this.scrollableColOffsets[scrollIdx] - scrollLeft;
      return {
        x,
        width: this.scrollableColumns[scrollIdx].width,
        isFrozen: false,
      };
    }
  }

  public hitTestHeader(canvasX: number, canvasY: number, scrollLeft: number): HeaderHitTestResult | null {
    if (canvasY < 0 || canvasY > this.headerHeight || canvasX <= this.rowNumberWidth) {
      return null;
    }

    let clickedCol = -1;
    let headerX = 0;
    let headerW = 0;

    // 1. Frozen Columns
    let curX = this.rowNumberWidth;
    for (let i = 0; i < this.frozenColumns.length; i++) {
      const w = this.frozenColumns[i].width;
      if (canvasX >= curX && canvasX < curX + w) {
        clickedCol = i;
        headerX = curX;
        headerW = w;
        break;
      }
      curX += w;
    }

    // 2. Scrollable Columns
    if (clickedCol === -1 && canvasX >= this.totalFrozenWidth) {
      const sx = canvasX - this.totalFrozenWidth + scrollLeft;
      if (sx >= 0 && sx < this.totalScrollableWidth && this.scrollableColumns.length > 0) {
        const sIdx = this.findScrollableColIndexAtX(sx);
        clickedCol = this.frozenColumns.length + sIdx;
        headerX = this.totalFrozenWidth + this.scrollableColOffsets[sIdx] - scrollLeft;
        headerW = this.scrollableColumns[sIdx]?.width || 100;
      }
    }

    if (clickedCol === -1 || !this.columns[clickedCol]) {
      return null;
    }

    const colDef = this.columns[clickedCol];
    const isFilterable = colDef.filterable !== false && colDef.type !== 'sparkline' && colDef.type !== 'action';
    const isFilterIconHit = isFilterable && canvasX >= headerX + headerW - 28 && canvasX <= headerX + headerW - 2;

    return {
      colIndex: clickedCol,
      column: colDef,
      headerX,
      headerWidth: headerW,
      isFilterIconHit,
    };
  }

  public hitTestRowNumber(
    canvasX: number,
    canvasY: number,
    scrollTop: number,
    rowCount: number
  ): number | null {
    if (canvasX < 0 || canvasX > this.rowNumberWidth || canvasY <= this.headerHeight) {
      return null;
    }
    const virtualY = canvasY - this.headerHeight + scrollTop;
    const row = Math.floor(virtualY / this.rowHeight);
    if (row < 0 || row >= rowCount) return null;
    return row;
  }

  public hitTestFillHandle(
    canvasX: number,
    canvasY: number,
    scrollLeft: number,
    scrollTop: number,
    selection: SelectionModel
  ): 'corner' | 'right-duplicate' | null {
    if (canvasY <= this.headerHeight || canvasX <= this.rowNumberWidth) return null;

    const norm = selection.getNormalizedRange();
    const rTopY = this.headerHeight + norm.minRow * this.rowHeight - scrollTop;
    const rHeight = (norm.maxRow - norm.minRow + 1) * this.rowHeight;
    const leftColRect = this.getColumnScreenRect(norm.minCol, scrollLeft);
    const rightColRect = this.getColumnScreenRect(norm.maxCol, scrollLeft);

    if (!leftColRect || !rightColRect) return null;

    const rLeftX = leftColRect.x;
    const rWidth = rightColRect.x + rightColRect.width - leftColRect.x;

    // 1. Bottom-right corner fill handle (12x12 hit box)
    const fhX = rLeftX + rWidth;
    const fhY = rTopY + rHeight;
    if (Math.abs(canvasX - fhX) <= 7 && Math.abs(canvasY - fhY) <= 7) {
      return 'corner';
    }

    // 2. Right-side quick duplicate button handle (centered vertically on right edge of selection)
    const dupX = rLeftX + rWidth;
    const dupY = rTopY + rHeight / 2;
    if (Math.abs(canvasX - dupX) <= 9 && Math.abs(canvasY - dupY) <= 9) {
      return 'right-duplicate';
    }

    return null;
  }

  public hitTest(
    canvasX: number,
    canvasY: number,
    scrollLeft: number,
    scrollTop: number,
    rowCount: number
  ): HitTestResult | null {
    if (canvasY <= this.headerHeight || canvasX <= this.rowNumberWidth) {
      return null;
    }

    const virtualY = canvasY - this.headerHeight + scrollTop;
    const row = Math.floor(virtualY / this.rowHeight);
    if (row < 0 || row >= rowCount) return null;

    const cellScreenY = this.headerHeight + row * this.rowHeight - scrollTop;
    const localY = canvasY - cellScreenY;

    // 1. Frozen Columns
    if (canvasX < this.totalFrozenWidth) {
      let curX = this.rowNumberWidth;
      for (let i = 0; i < this.frozenColumns.length; i++) {
        const w = this.frozenColumns[i].width;
        if (canvasX >= curX && canvasX < curX + w) {
          return {
            row,
            col: i,
            localX: canvasX - curX,
            localY,
            isFrozen: true,
            cellRect: { x: curX, y: cellScreenY, width: w, height: this.rowHeight },
          };
        }
        curX += w;
      }
      return null;
    }

    // 2. Scrollable Columns
    const scrollX = canvasX - this.totalFrozenWidth + scrollLeft;
    if (scrollX < 0 || scrollX >= this.totalScrollableWidth || this.scrollableColumns.length === 0) {
      return null;
    }

    const scrollIdx = this.findScrollableColIndexAtX(scrollX);
    const colIndex = this.frozenColumns.length + scrollIdx;
    const cellScreenX = this.totalFrozenWidth + this.scrollableColOffsets[scrollIdx] - scrollLeft;
    const width = this.scrollableColumns[scrollIdx].width;

    return {
      row,
      col: colIndex,
      localX: canvasX - cellScreenX,
      localY,
      isFrozen: false,
      cellRect: { x: cellScreenX, y: cellScreenY, width, height: this.rowHeight },
    };
  }

  public hitTestColumnResize(
    canvasX: number,
    canvasY: number,
    scrollLeft: number
  ): { colIndex: number; isFrozen: boolean } | null {
    if (canvasY > this.headerHeight || canvasY < 0) return null;

    let curX = this.rowNumberWidth;
    for (let i = 0; i < this.frozenColumns.length; i++) {
      curX += this.frozenColumns[i].width;
      if (Math.abs(canvasX - curX) <= 4) {
        return { colIndex: i, isFrozen: true };
      }
    }

    if (canvasX >= this.totalFrozenWidth) {
      for (let i = 0; i < this.scrollableColumns.length; i++) {
        const borderX =
          this.totalFrozenWidth + this.scrollableColOffsets[i + 1] - scrollLeft;
        if (Math.abs(canvasX - borderX) <= 4) {
          return { colIndex: this.frozenColumns.length + i, isFrozen: false };
        }
      }
    }

    return null;
  }
}
