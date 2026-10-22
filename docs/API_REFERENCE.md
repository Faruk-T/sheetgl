# SheetGL API Reference

Complete TypeScript interface specifications, component properties, and callback signatures for SheetGL.

---

## 1. `<SheetGL />` Component Props

The top-level React component.

```tsx
import { SheetGL, SheetGLProps } from 'sheetgl';
```

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `dataSource` | `any[] \| IDataStore` | *Required* | Array of JavaScript objects for client mode, or an `IDataStore` instance (e.g. `RemoteDataStore`). |
| `columns` | `ColumnDef[]` | *Required* | Array of column definitions determining grid layout, sorting, and cell types. |
| `columnGroups` | `ColumnGroupDef[]` | `[]` | Optional Banded Column Group definitions for multi-level header bands and group-wide Dark/Light coloring. |
| `groupHeaderHeight` | `number` | `30` | Height in pixels for the top Banded Column Group header row when column groups are active. |
| `theme` | `ThemeInput` | `'apple-light'` | Theme name (`'apple-light'`, `'apple-dark'`, `'google-light'`, `'google-dark'`, `'system'`) or custom `IGridThemeTokens`. |
| `locale` | `LocaleInput` | `'en'` | Locale code (`'en'`, `'tr'`) or a partial `IGridLocale` object overriding specific UI labels. |
| `rowHeight` | `number` | `34` | Height in pixels for each grid data row. |
| `headerHeight` | `number` | `38` | Height in pixels for the column header ribbon. |
| `initialSort` | `SortDescriptor[]` | `[]` | Initial sorting rules applied upon grid mount. |
| `initialGroups` | `GroupDescriptor[]` | `[]` | Initial column groupings applied upon grid mount. |
| `onCellChange` | `(row: any, colId: string, val: any) => void` | `undefined` | Callback invoked when a cell edit is committed by the user. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline CSS styles applied to the outer container. |
| `className` | `string` | `undefined` | Optional CSS class name for the outer container. |

---

## 2. Column Definition (`ColumnDef`)

Specifies the layout, behavior, and formatting of individual columns.

```ts
export interface ColumnDef {
  id: string;
  title: string;
  type?: ColumnType;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  pinned?: 'left' | 'right' | false;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  readonly?: boolean;
  align?: 'left' | 'center' | 'right';

  // Banded Column Group & Dark/Light Theme-Aware Coloring
  headerGroup?: string | ColumnGroupDef;
  groupId?: string;
  color?: ThemeAwareColor;          // Preset ('blue' | 'indigo' | 'emerald' | ...) or { light, dark }
  headerColor?: ThemeAwareColor;    // Custom header background color
  headerTextColor?: ThemeAwareColor;// Custom header text color
  columnColor?: ThemeAwareColor;    // Custom column cell background color
  columnTextColor?: ThemeAwareColor;// Custom column cell text color
  style?: ColumnColorConfig;        // Granular { headerBg, headerText, headerAccent, columnBg, columnText, borderColor }

  // Column-Specific Options
  currencySymbol?: string;          // Used by 'currency' column (e.g. '$', '€', '₺')
  decimalDigits?: number;           // Precision digits for 'currency' & 'number'
  options?: SelectOption[];         // Options array for 'select' column
  sparklineColor?: string;          // Stroke color for 'sparkline' column
  buttonText?: string;              // Button label for 'action' column
  onActionClick?: (row: any) => void; // Click callback for 'action' column
}
```

### Supported Column Types (`ColumnType`)
- `'text'`: Default text cell with double-click inline editor.
- `'number'`: Numeric formatted cell.
- `'currency'`: Currency formatted cell with customizable prefix/suffix symbol.
- `'boolean'`: Interactive Zero-DOM checkbox switch.
- `'select'`: Pill badge with searchable dropdown combobox.
- `'date'`: Formatted ISO date with date picker popover.
- `'rating'`: Interactive 5-star rating widget.
- `'progress'`: Visual progress bar with numeric percentage.
- `'sparkline'`: 7-point trend line graph.
- `'action'`: Interactive button triggering custom callbacks.
- Custom registered string types (via `ColumnTypeRegistry`).

---

## 3. Data Store Interface (`IDataStore`)

The abstract data layer interfacing client or server datasets.

```ts
export interface IDataStore {
  // Event Emitter
  on(event: 'loaded' | 'loading' | 'error' | 'cellChanged', listener: Function): void;
  off(event: string, listener: Function): void;

  // Data Retrieval
  load(): Promise<void>;
  getRowCount(): number;
  getViewRow(index: number): VirtualRow | null;
  getCell(rowKey: any, field: string): any;
  setCell(rowKey: any, field: string, value: any): void;

  // Operations
  setFilter(filter: FilterDescriptor | null): void;
  setSort(sort: SortDescriptor[]): void;
  setGrouping(groups: GroupDescriptor[]): void;
  setSearch(keyword: string): void;

  // Aggregations
  getSummaries(): Record<string, number>;
  getDistinctValues(field: string): Promise<DistinctItem[]>;
}
```

---

## 4. Column Type Plugin Interface (`IColumnTypePlugin`)

Contract for creating custom cell renderers and editors.

```ts
export interface CellPaintContext {
  ctx: CanvasRenderingContext2D;
  value: any;
  column: ColumnDef;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered: boolean;
}

export interface CellEditorProps {
  value: any;
  column: ColumnDef;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  rect: { x: number; y: number; width: number; height: number };
  initialChar?: string;
  onCommit: (newValue: any, moveDir?: 'down' | 'right' | 'left' | 'none') => void;
  onCancel: () => void;
}

export interface IColumnTypePlugin {
  type: string;
  paint(context: CellPaintContext): void;
  editorComponent?: React.ComponentType<CellEditorProps>;
  onCellClick?(params: {
    row: number;
    col: number;
    value: any;
    column: ColumnDef;
    clientX: number;
    clientY: number;
    cellX: number;
    cellY: number;
  }): boolean;
  measureWidth?(value: any, font: string): number;
  getExportText?(value: any): string;
  parseValue?(rawText: string): any;
}
```

---

## 5. Internationalization Engine (`LocaleEngine`)

```ts
import { LocaleEngine, IGridLocale } from 'sheetgl';

// Register a new locale
LocaleEngine.registerLocale('fr-FR', frenchLocale);

// Resolve locale by string or partial
const locale = LocaleEngine.resolve('fr-FR');
```

### `IGridLocale` Properties
```ts
export interface IGridLocale {
  code: string;
  language: string;

  // Toolbar & Theme
  searchPlaceholder: string;
  addGroup: string;
  exportCsv: string;
  rows: string;
  columns: string;
  systemTheme: string;

  // Formula Bar & Status
  formulaBarPlaceholder: string;
  totalRecords: string;

  // Header Filter Popover
  searchValuesPlaceholder: string;
  selectAll: string;
  clear: string;
  apply: string;
  loading: string;
  noMatches: string;

  // Common Values
  emptyText: string;
  trueText: string;
  falseText: string;
  ratingOutOf: (val: number) => string;
  groupRecordCount: (count: number) => string;
}
```
