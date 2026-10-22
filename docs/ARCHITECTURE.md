# SheetGL Architecture & Technical Design

This document details the internal architecture, mathematical models, rendering pipeline, and engineering decisions behind **SheetGL**.

---

## 1. High-Level Architectural Overview

SheetGL is engineered to solve the fundamental performance bottleneck of enterprise web data grids: **DOM Bloat**.

In standard HTML/DOM-based grids (e.g., standard React tables or unvirtualized grids), rendering 10,000 rows with 30 columns produces **300,000+ DOM nodes**, resulting in extreme memory usage (300MB+), catastrophic layout thrashing, and sluggish rendering.

SheetGL completely sidesteps the DOM tree by utilizing a **Single-Canvas 2D Rendering Pipeline** with an ephemeral **Micro-DOM Floating Layer**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SheetGL React Root                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  ToolBar.tsx │             │FormulaBar.tsx│             │SummaryFooter │
└──────────────┘             └──────────────┘             └──────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌──────────────────────────────────────┐          ┌───────────────────────────────────┐
│         Physical HTML5 Canvas        │          │    Virtual Scroll & Event Box     │
│     (Single <canvas> surface)        │          │  (Zero-DOM transparent container) │
│ - Header cells & sort glyphs         │          └─────────────────┬─────────────────┘
│ - Data cells via Column Plugins      │                            │
│ - Zero-DOM checkboxes & ratings      │                            ▼
│ - Selection bounding rectangle       │          ┌───────────────────────────────────┐
│ - Excel fill handle & resize guides  │          │     Ephemeral Micro-DOM Layer     │
│ - Virtualized group header bands     │          │  - Active in-place cell editor    │
└──────────────────────────────────────┘          │  - Header filter search popover   │
                                                  └───────────────────────────────────┘
```

---

## 2. Core Mathematical Engines

All core logic is implemented in pure, zero-dependency TypeScript modules located under `src/datagrid/core/`. These modules are completely decoupled from React and DOM APIs.

### 2.1. GeometryEngine (`GeometryEngine.ts`)
The `GeometryEngine` manages the coordinate space, column dimensions, and hit testing.

- **Prefix-Sum Column Offset Table:**
  Column horizontal positions are precomputed in $O(N)$ time into prefix sums:
  $$\text{scrollableColOffsets}[i] = \sum_{k=0}^{i-1} \text{width}_k$$
- **Binary Search Column Indexing:**
  Given an arbitrary mouse click at $X$ coordinate in the virtual scroll space, the column index is determined in $O(\log N)$ time using binary search (`findScrollColIndexAtOffset`), guaranteeing zero hit-test overhead even with 5,000+ columns.
- **Resize Guide Hit Testing:**
  A 4-pixel tolerance boundary around column borders detects hover and drag states for fluid column resizing.

### 2.2. GroupingEngine (`GroupingEngine.ts`)
The `GroupingEngine` transforms a multidimensional grouped dataset into a 1D **Flattened Virtual Row Array** (`VirtualRow[]`):

```ts
export type VirtualRow =
  | {
      type: 'group';
      field: string;
      value: any;
      level: number;
      isExpanded: boolean;
      rowCount: number;
      summaries?: Record<string, number>;
    }
  | {
      type: 'data';
      data: any;
      level: number;
    };
```

- **0ms Expand / Collapse:**
  When a user collapses or expands a group node, only the projection indices are recalculated. The raw data remains intact in memory.
- **Recursive Group Aggregations:**
  Recursive group summaries (sum, avg, count, min, max) are calculated in a single linear pass and stored directly in group header nodes.

### 2.3. FilterEngine (`FilterEngine.ts`)
Evaluates composite abstract syntax tree (AST) filter expressions:

```ts
type FilterDescriptor =
  | [string, FilterOperation, any]
  | [FilterDescriptor, 'and' | 'or', FilterDescriptor];
```

Supported comparison operations:
- `=`, `<>`, `<`, `<=`, `>`, `>=`
- `contains`, `notcontains`, `startswith`, `endswith`
- `in`, `notin`
- `between`

### 2.4. SortEngine (`SortEngine.ts`)
- Implements multi-column sorting (`Shift + Click` on column headers).
- Natural string and numeric sorting using standard `Intl.Collator` with numeric collation enabled (`numeric: true`), sorting `Item 2` before `Item 10` accurately.

### 2.5. SelectionModel & HistoryManager
- **SelectionModel (`SelectionModel.ts`):** Maintains active cell anchor coordinates and 2D rectangular bounding ranges `CellRange { startRow, startCol, endRow, endCol }`.
- **HistoryManager (`HistoryManager.ts`):** A bounded 50-step Command Pattern stack supporting `Undo` (`Ctrl + Z`) and `Redo` (`Ctrl + Y`).

---

## 3. Pluggable Column Architecture (SOLID / Open-Closed)

Each column type is an isolated plugin conforming to `IColumnTypePlugin`:

```ts
export interface IColumnTypePlugin {
  type: string;
  paint(context: CellPaintContext): void;
  editorComponent?: React.ComponentType<CellEditorProps>;
  onCellClick?(params: CellClickContext): boolean;
  measureWidth?(value: any, font: string): number;
  getExportText?(value: any): string;
  parseValue?(rawText: string): any;
}
```

### Zero-DOM vs. Micro-DOM Plugins
1. **Zero-DOM (Direct Canvas Interactivity):**
   - Plugins such as `BooleanColumn` and `RatingColumn` paint checkboxes and star ratings entirely onto Canvas 2D.
   - Their `onCellClick()` hook directly handles clicks by toggling data values or setting ratings without mounting any DOM element.
2. **Micro-DOM (Floating Overlay on Edit):**
   - For text, numbers, dates, and dropdown comboboxes, double-clicking (or pressing `Enter`) mounts an ephemeral React component positioned exactly over the target cell's bounding box.
   - When the user presses `Enter` or blurs, the edit commits to the store and the DOM node is immediately unmounted.

---

## 4. Dual-Store Data Architecture

SheetGL provides two interchangeable implementations of `IDataStore`:

### 4.1. LocalDataStore (`LocalDataStore.ts`)
- **Use Case:** Datasets up to 100,000 rows residing in client memory.
- **Behavior:** All filtering, multi-sorting, grouping, and aggregations run client-side in sub-millisecond execution times.

### 4.2. RemoteDataStore (`RemoteDataStore.ts`)
- **Use Case:** Millions of records residing on backend servers (SQL, Elasticsearch, MongoDB).
- **Behavior:**
  - Offloads `skip`, `take`, `sort`, `filter`, and `group` operations to the backend REST API using standard query conventions.
  - **Chunked LRU Block Caching (`BlockCache.ts`):** Caches records in configurable chunks (e.g. 100 rows per chunk) with a Least Recently Used eviction policy.
  - **AbortController:** Fast scrolling automatically cancels obsolete in-flight HTTP requests, avoiding race conditions and saving server bandwidth.

---

## 5. Dual-Bridge Theme Engine

Canvas 2D contexts cannot evaluate CSS classes or variables natively. SheetGL bridges this gap using the **Dual-Bridge Theme Pattern**:

1. **Canvas Tokens:** Passed as raw hex and rgba color strings directly into the render loop (`theme.canvas.bg`, `theme.canvas.gridLine`, `theme.canvas.cellText`, etc.).
2. **DOM Variables:** Simultaneously injected into HTML containers for toolbars, context menus, and micro-DOM editors (`theme.dom.toolbarBg`, `theme.dom.glassBackdrop`, etc.).
3. **OS Auto-Detection:** `ThemeEngine.watchSystem()` automatically synchronizes with the user's OS dark/light mode preference using `window.matchMedia('(prefers-color-scheme: dark)')`.
