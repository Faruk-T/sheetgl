import { SummaryType } from './group';
import { BatchChanges, IDataStore } from './store';

export type ColumnId = string;

export type ColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'boolean'
  | 'select'
  | 'dropdown'
  | 'multiselect'
  | 'progress'
  | 'date'
  | 'datetime'
  | 'time'
  | 'rating'
  | 'sparkline'
  | 'action'
  | (string & {});

export type ColumnPermission = 'write' | 'readonly' | 'read';

export interface SelectOption {
  value: string;
  label: string;
  bg?: string;
  fg?: string;
  darkBg?: string;
  darkFg?: string;
}

export interface CascadingUpdateContext {
  rowKey: any;
  columnId: string;
  store: IDataStore;
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
  permission?: ColumnPermission;
  visible?: boolean;
  align?: 'left' | 'center' | 'right';
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
  defaultValue?: any;
  summaryType?: SummaryType;

  /**
   * Conditional permission callback per row/cell (DevExtreme-style allowEditing rule)
   */
  canEdit?: (row: any, column: ColumnDef) => boolean;

  /**
   * Cell validation rule before committing an edit
   */
  validator?: (value: any, row: any) => { valid: boolean; message?: string } | boolean;

  /**
   * DevExtreme-style setCellValue cascading hook (sync or async backend fetch).
   * Can mutate `newData` or return a Promise resolving to a partial row patch fetched from backend.
   */
  setCellValue?: (
    newData: Record<string, any>,
    value: any,
    currentRowData: Record<string, any>,
    context: CascadingUpdateContext
  ) => void | Record<string, any> | Promise<void | Record<string, any>>;
}

export interface GridPermissions {
  mode?: 'write' | 'read' | 'readonly';
  allowAdding?: boolean;
  allowUpdating?: boolean;
  allowDeleting?: boolean;
  allowDuplicating?: boolean;
  allowClipboardPaste?: boolean;
  allowExport?: boolean;
  allowFiltering?: boolean;
  allowSorting?: boolean;
  allowGrouping?: boolean;
  allowBatchSave?: boolean;
}

export interface EditingStartEvent {
  row: Record<string, any>;
  rowKey: any;
  rowIndex: number;
  column: ColumnDef;
  value: any;
  cancel?: boolean;
}

export interface CellValueChangingEvent {
  row: Record<string, any>;
  rowKey: any;
  rowIndex: number;
  column: ColumnDef;
  oldValue: any;
  newValue: any;
  cancel?: boolean;
  errorMessage?: string;
}

export interface CellValueChangedEvent {
  row: Record<string, any>;
  rowKey: any;
  rowIndex: number;
  column: ColumnDef;
  oldValue: any;
  newValue: any;
  updateRow: (patch: Record<string, any>) => void;
}

export interface RowInsertingEvent {
  data: Record<string, any>;
  targetRowIndex?: number;
  cancel?: boolean;
}

export interface RowInsertedEvent {
  data: Record<string, any>;
  key: any;
}

export interface RowUpdatingEvent {
  key: any;
  oldData: Record<string, any>;
  newData: Record<string, any>;
  cancel?: boolean;
}

export interface RowUpdatedEvent {
  key: any;
  data: Record<string, any>;
}

export interface RowRemovingEvent {
  key: any;
  data: Record<string, any>;
  cancel?: boolean;
}

export interface RowRemovedEvent {
  key: any;
  data: Record<string, any>;
}

export interface SavingEvent {
  changes: BatchChanges;
  cancel?: boolean;
}

export interface SavedEvent {
  changes: BatchChanges;
}

export interface GridEventLogEntry {
  id: string;
  timestamp: string;
  eventName: string;
  summary: string;
  payload?: any;
  status?: 'info' | 'success' | 'warning' | 'async';
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
