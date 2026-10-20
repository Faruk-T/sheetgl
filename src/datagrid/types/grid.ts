import React from 'react';
import { IGridThemeTokens } from '../theme/IGridTheme';

export type ColumnId = string;

export type ColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'progress'
  | 'date'
  | 'rating'
  | 'sparkline'
  | 'action';

export interface SelectOption {
  value: string;
  label: string;
  bg?: string;
  fg?: string;
  darkBg?: string;
  darkFg?: string;
}

export interface ColumnDef {
  id: ColumnId;
  title: string;
  type: ColumnType;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  pinned?: 'left' | 'right' | boolean;
  readonly?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  currencySymbol?: string;
  decimalDigits?: number;
  options?: SelectOption[];
  sparklineColor?: string;
  buttonText?: string;
  onActionClick?: (row: any, rowIndex: number) => void;
  headerTooltip?: string;
}

export interface CellCoords {
  row: number;
  col: number;
}

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface ActiveOverlayState {
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  column: ColumnDef;
  initialValue: any;
  initialChar?: string;
}
