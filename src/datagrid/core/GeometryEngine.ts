import { ColumnDef } from '../types/grid';

export interface HitTestResult {
  row: number;
  col: number;
  localX: number;
  localY: number;
  isFrozen: boolean;
  cellRect: { x: number; y: number; width: number; height: number };
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
    this.columns = columns;
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

  // O(log N) Binary Search ile verilen X pikselinin hangi scrollable sütuna denk geldiğini bulur
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

  // Genel sütun indeksinden (0..columns.length-1) ekrandaki X koordinatını hesaplar
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
      return { x, width: this.frozenColumns[colIndex].width, isFrozen: true };
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

  // Ekrandaki (canvasX, canvasY) koordinatının hangi hücreye denk geldiğini bulur
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

    // 1. Frozen Sütunlar
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

    // 2. Scrollable Sütunlar
    const scrollX = canvasX - this.totalFrozenWidth + scrollLeft;
    if (scrollX < 0 || scrollX >= this.totalScrollableWidth) return null;

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

  // Başlıkta sütun resize sınırına (sağ kenar ±4px) denk gelip gelmediğini kontrol eder
  public hitTestColumnResize(
    canvasX: number,
    canvasY: number,
    scrollLeft: number
  ): { colIndex: number; isFrozen: boolean } | null {
    if (canvasY > this.headerHeight) return null;

    // 1. Frozen sütun sınırları
    let curX = this.rowNumberWidth;
    for (let i = 0; i < this.frozenColumns.length; i++) {
      curX += this.frozenColumns[i].width;
      if (Math.abs(canvasX - curX) <= 5) {
        return { colIndex: i, isFrozen: true };
      }
    }

    // 2. Scrollable sütun sınırları
    if (canvasX >= this.totalFrozenWidth) {
      for (let i = 0; i < this.scrollableColumns.length; i++) {
        const borderX =
          this.totalFrozenWidth + this.scrollableColOffsets[i + 1] - scrollLeft;
        if (Math.abs(canvasX - borderX) <= 5) {
          return { colIndex: this.frozenColumns.length + i, isFrozen: false };
        }
      }
    }

    return null;
  }
}
