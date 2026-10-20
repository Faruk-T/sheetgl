import { CellCoords, CellRange } from '../types/grid';

export class SelectionModel {
  public activeCell: CellCoords = { row: 0, col: 0 };
  public selectionRange: CellRange | null = null;
  public isSelecting: boolean = false;

  public setActiveCell(row: number, col: number): void {
    this.activeCell = { row, col };
    this.selectionRange = { startRow: row, startCol: col, endRow: row, endCol: col };
  }

  public setRangeEnd(row: number, col: number): void {
    if (!this.selectionRange) {
      this.selectionRange = { startRow: this.activeCell.row, startCol: this.activeCell.col, endRow: row, endCol: col };
    } else {
      this.selectionRange = {
        ...this.selectionRange,
        endRow: row,
        endCol: col,
      };
    }
  }

  public getNormalizedRange(): { minRow: number; maxRow: number; minCol: number; maxCol: number } {
    if (!this.selectionRange) {
      return {
        minRow: this.activeCell.row,
        maxRow: this.activeCell.row,
        minCol: this.activeCell.col,
        maxCol: this.activeCell.col,
      };
    }

    return {
      minRow: Math.min(this.selectionRange.startRow, this.selectionRange.endRow),
      maxRow: Math.max(this.selectionRange.startRow, this.selectionRange.endRow),
      minCol: Math.min(this.selectionRange.startCol, this.selectionRange.endCol),
      maxCol: Math.max(this.selectionRange.startCol, this.selectionRange.endCol),
    };
  }

  public isCellSelected(row: number, col: number): boolean {
    const { minRow, maxRow, minCol, maxCol } = this.getNormalizedRange();
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  }

  public hasMultiCellSelection(): boolean {
    const { minRow, maxRow, minCol, maxCol } = this.getNormalizedRange();
    return minRow !== maxRow || minCol !== maxCol;
  }
}
