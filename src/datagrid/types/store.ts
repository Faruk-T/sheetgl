import { FilterDescriptor, SortDescriptor, DistinctItem } from './filter';
import { GroupDescriptor, SummaryDescriptor, VirtualRow } from './group';

export interface DataGridQuery {
  skip?: number;
  take?: number;
  filter?: FilterDescriptor | null;
  sort?: SortDescriptor[];
  group?: GroupDescriptor[];
  groupSummary?: SummaryDescriptor[];
  totalSummary?: SummaryDescriptor[];
  search?: string;
}

export interface LoadResult {
  data: any[];
  totalCount: number;
  summary?: number[];
  groupCount?: number;
}

export interface RemoteOperationsConfig {
  paging?: boolean;
  filtering?: boolean;
  sorting?: boolean;
  grouping?: boolean;
  summary?: boolean;
  distinct?: boolean;
}

export interface BatchChanges {
  inserted?: any[];
  updated?: Array<{ key: any; values: Record<string, any> }>;
  deleted?: any[];
}

export interface IReadableStore {
  getRowCount(): number;
  getViewRow(rowIndex: number): VirtualRow | undefined;
  ensureRange(startRow: number, endRow: number): Promise<void>;
  on(event: 'loading' | 'loaded' | 'error', callback: (...args: any[]) => void): void;
  off(event: 'loading' | 'loaded' | 'error', callback: (...args: any[]) => void): void;
}

export interface IFilterableStore {
  setFilter(filter: FilterDescriptor | null): Promise<void>;
  setSearch(keyword: string): Promise<void>;
  getDistinctValues(columnId: string, search?: string): Promise<DistinctItem[]>;
}

export interface ISortableStore {
  setSorting(sortRules: SortDescriptor[]): Promise<void>;
}

export interface IGroupableStore {
  setGrouping(groupDescriptors: GroupDescriptor[]): Promise<void>;
  toggleGroup(groupKey: string): Promise<void>;
}

export interface IMutableStore {
  setCell(rowKey: any, columnId: string, value: any): Promise<void>;
  commitBatch(changes: BatchChanges): Promise<void>;
}

export interface IDataStore
  extends IReadableStore,
    IFilterableStore,
    ISortableStore,
    IGroupableStore,
    IMutableStore {
  getSummaries(): Record<string, number> | undefined;
  isRemote(): boolean;
}
