import { IDataStore, BatchChanges, RemoteOperationsConfig } from '../types/store';
import { FilterDescriptor, SortDescriptor, DistinctItem } from '../types/filter';
import { GroupDescriptor, VirtualRow } from '../types/group';
import { BlockCache } from './BlockCache';

export interface RemoteDataStoreOptions {
  url: string;
  keyField?: string;
  remoteOperations?: RemoteOperationsConfig;
  headers?: Record<string, string>;
  blockSize?: number;
}

export class RemoteDataStore implements IDataStore {
  private url: string;
  private keyField: string;
  private headers: Record<string, string>;
  private cache: BlockCache<any>;

  private totalCount: number = 0;
  private summaries?: Record<string, number>;
  private currentFilter: FilterDescriptor | null = null;
  private currentSearch: string = '';
  private currentSort: SortDescriptor[] = [];
  private currentGroups: GroupDescriptor[] = [];

  private currentAbortController: AbortController | null = null;
  private pendingBlockRequests = new Set<number>();
  private listeners = new Map<string, Set<(...args: any[]) => void>>();

  constructor(options: RemoteDataStoreOptions) {
    this.url = options.url;
    this.keyField = options.keyField || 'id';
    this.headers = options.headers || { 'Content-Type': 'application/json' };
    this.cache = new BlockCache<any>(options.blockSize || 50, 30);
  }

  public isRemote(): boolean {
    return true;
  }

  public getRowCount(): number {
    return this.totalCount;
  }

  public getViewRow(rowIndex: number): VirtualRow | undefined {
    const data = this.cache.getRow(rowIndex);
    if (!data) return undefined;
    return {
      type: 'data',
      rawIndex: rowIndex,
      data,
    };
  }

  public async ensureRange(startRow: number, endRow: number): Promise<void> {
    const startBlock = this.cache.getBlockIndex(startRow);
    const endBlock = this.cache.getBlockIndex(endRow);

    const missingBlocks: number[] = [];
    for (let b = startBlock; b <= endBlock; b++) {
      if (!this.cache.hasBlock(b) && !this.pendingBlockRequests.has(b)) {
        missingBlocks.push(b);
      }
    }

    if (missingBlocks.length === 0) return Promise.resolve();

    // Eksik blokları sunucudan çek
    return Promise.all(missingBlocks.map((b) => this.fetchBlock(b))).then(() => {});
  }

  private async fetchBlock(blockIndex: number): Promise<void> {
    this.pendingBlockRequests.add(blockIndex);
    const skip = blockIndex * this.cache.blockSize;
    const take = this.cache.blockSize;

    const payload = {
      skip,
      take,
      requireTotalCount: true,
      filter: this.currentFilter,
      sort: this.currentSort,
      search: this.currentSearch,
      group: this.currentGroups,
    };

    try {
      this.emit('loading');
      const res = await fetch(this.url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const json = await res.json();
      const rows = json.data || [];
      this.totalCount = json.totalCount ?? rows.length;
      if (json.summary) {
        this.summaries = json.summary;
      }

      this.cache.setBlock(blockIndex, rows);
      this.pendingBlockRequests.delete(blockIndex);
      this.emit('loaded');
    } catch (err: any) {
      this.pendingBlockRequests.delete(blockIndex);
      if (err.name !== 'AbortError') {
        this.emit('error', err);
      }
    }
  }

  public async setFilter(filter: FilterDescriptor | null): Promise<void> {
    this.currentFilter = filter;
    this.resetAndReload();
    return Promise.resolve();
  }

  public async setSearch(keyword: string): Promise<void> {
    this.currentSearch = keyword;
    this.resetAndReload();
    return Promise.resolve();
  }

  public async setSorting(sortRules: SortDescriptor[]): Promise<void> {
    this.currentSort = sortRules;
    this.resetAndReload();
    return Promise.resolve();
  }

  public async setGrouping(groupDescriptors: GroupDescriptor[]): Promise<void> {
    this.currentGroups = groupDescriptors;
    this.resetAndReload();
    return Promise.resolve();
  }

  public async toggleGroup(_groupKey: string): Promise<void> {
    // Sunucu taraflı lazy gruplama genişletmesi
    this.resetAndReload();
    return Promise.resolve();
  }

  public async setCell(rowKey: any, columnId: string, value: any): Promise<void> {
    try {
      await fetch(`${this.url}/${rowKey}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ [columnId]: value }),
      });
      this.resetAndReload();
    } catch (err) {
      this.emit('error', err);
    }
  }

  public async commitBatch(changes: BatchChanges): Promise<void> {
    try {
      await fetch(`${this.url}/batch`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(changes),
      });
      this.resetAndReload();
    } catch (err) {
      this.emit('error', err);
    }
  }

  public async getDistinctValues(columnId: string, search?: string): Promise<DistinctItem[]> {
    try {
      const distinctUrl = `${this.url}/distinct?column=${encodeURIComponent(columnId)}&search=${encodeURIComponent(search || '')}`;
      const res = await fetch(distinctUrl, {
        method: 'GET',
        headers: this.headers,
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.items || [];
    } catch {
      return [];
    }
  }

  public getSummaries(): Record<string, number> | undefined {
    return this.summaries;
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((cb) => cb(...args));
  }

  private resetAndReload(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.currentAbortController = new AbortController();
    this.cache.clear();
    this.pendingBlockRequests.clear();
    this.fetchBlock(0);
  }
}
