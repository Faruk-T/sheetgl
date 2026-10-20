import { IDataStore, BatchChanges } from '../types/store';
import { FilterDescriptor, SortDescriptor, DistinctItem } from '../types/filter';
import { GroupDescriptor, VirtualRow } from '../types/group';
import { FilterEngine } from '../core/FilterEngine';
import { SortEngine } from '../core/SortEngine';
import { GroupingEngine } from '../core/GroupingEngine';

export interface LocalDataStoreOptions {
  data: any[];
  keyField?: string;
}

export class LocalDataStore implements IDataStore {
  private rawData: any[] = [];
  private keyField: string;

  // Filtrelenmiş & Sıralanmış ham veri referansları
  private processedData: any[] = [];
  // Gruplanmış sanal satırlar (VirtualRow[])
  private virtualRows: VirtualRow[] = [];

  private currentFilter: FilterDescriptor | null = null;
  private currentSearch: string = '';
  private currentSort: SortDescriptor[] = [];
  private currentGroups: GroupDescriptor[] = [];
  private expandedGroupKeys = new Set<string>();

  private listeners = new Map<string, Set<(...args: any[]) => void>>();

  constructor(options: LocalDataStoreOptions) {
    this.keyField = options.keyField || 'id';
    this.setData(options.data || []);
  }

  public isRemote(): boolean {
    return false;
  }

  public setData(data: any[]): void {
    this.rawData = data.map((item, idx) => ({
      ...item,
      __rawIndex: idx,
      [this.keyField]: item[this.keyField] ?? idx,
    }));
    this.recompute();
  }

  public getRowCount(): number {
    return this.virtualRows.length;
  }

  public getViewRow(rowIndex: number): VirtualRow | undefined {
    return this.virtualRows[rowIndex];
  }

  public async ensureRange(_startRow: number, _endRow: number): Promise<void> {
    // In-memory olduğu için veri zaten hazırdır
    return Promise.resolve();
  }

  public async setFilter(filter: FilterDescriptor | null): Promise<void> {
    this.currentFilter = filter;
    this.recompute();
    return Promise.resolve();
  }

  public async setSearch(keyword: string): Promise<void> {
    this.currentSearch = keyword;
    this.recompute();
    return Promise.resolve();
  }

  public async setSorting(sortRules: SortDescriptor[]): Promise<void> {
    this.currentSort = sortRules;
    this.recompute();
    return Promise.resolve();
  }

  public async setGrouping(groupDescriptors: GroupDescriptor[]): Promise<void> {
    this.currentGroups = groupDescriptors;
    // Varsayılan olarak ilk seviyedeki grupları açık yap
    this.expandedGroupKeys.clear();
    this.recompute();
    return Promise.resolve();
  }

  public async toggleGroup(groupKey: string): Promise<void> {
    if (this.expandedGroupKeys.has(groupKey)) {
      this.expandedGroupKeys.delete(groupKey);
    } else {
      this.expandedGroupKeys.add(groupKey);
    }
    this.recomputeVirtualRowsOnly();
    return Promise.resolve();
  }

  public async setCell(rowKey: any, columnId: string, value: any): Promise<void> {
    const item = this.rawData.find((r) => r[this.keyField] === rowKey);
    if (item) {
      item[columnId] = value;
      this.recompute();
    }
    return Promise.resolve();
  }

  public async commitBatch(changes: BatchChanges): Promise<void> {
    if (changes.updated) {
      for (const u of changes.updated) {
        const item = this.rawData.find((r) => r[this.keyField] === u.key);
        if (item) Object.assign(item, u.values);
      }
    }
    if (changes.inserted) {
      for (const ins of changes.inserted) {
        this.rawData.push({
          ...ins,
          __rawIndex: this.rawData.length,
          [this.keyField]: ins[this.keyField] ?? `temp_${Date.now()}_${Math.random()}`,
        });
      }
    }
    if (changes.deleted) {
      const delKeys = new Set(changes.deleted);
      this.rawData = this.rawData.filter((r) => !delKeys.has(r[this.keyField]));
    }
    this.recompute();
    return Promise.resolve();
  }

  public async getDistinctValues(columnId: string, search?: string): Promise<DistinctItem[]> {
    const counts = new Map<any, number>();
    for (let i = 0; i < this.rawData.length; i++) {
      const val = this.rawData[i][columnId];
      if (val !== undefined && val !== null && val !== '') {
        counts.set(val, (counts.get(val) || 0) + 1);
      }
    }

    let items: DistinctItem[] = Array.from(counts.entries()).map(([val, count]) => ({
      value: val,
      label: String(val),
      count,
    }));

    if (search) {
      const s = search.toLowerCase();
      items = items.filter((it) => it.label.toLowerCase().includes(s));
    }

    items.sort((a, b) => (b.count || 0) - (a.count || 0));
    return Promise.resolve(items);
  }

  public getSummaries(): Record<string, number> | undefined {
    // Sadece filtrelenmiş verinin toplamları
    if (this.processedData.length === 0) return undefined;
    const sums: Record<string, number> = {};
    const sample = this.processedData[0];

    for (const key of Object.keys(sample)) {
      if (typeof sample[key] === 'number') {
        let sum = 0;
        for (let i = 0; i < this.processedData.length; i++) {
          sum += Number(this.processedData[i][key]) || 0;
        }
        sums[key] = sum;
      }
    }
    return sums;
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

  private recompute(): void {
    this.emit('loading');

    // 1. Filtreleme
    let filtered = this.rawData;
    if (this.currentFilter) {
      filtered = filtered.filter((row) => FilterEngine.evaluateRow(row, this.currentFilter));
    }

    // 2. Global Arama
    if (this.currentSearch) {
      filtered = filtered.filter((row) => FilterEngine.matchSearch(row, this.currentSearch));
    }

    // 3. Sıralama
    if (this.currentSort.length > 0) {
      const cmp = SortEngine.createComparator(this.currentSort);
      filtered = [...filtered].sort(cmp);
    }

    this.processedData = filtered;

    // 4. Gruplama ve Sanal Satır Projeksiyonu
    this.recomputeVirtualRowsOnly();

    this.emit('loaded');
  }

  private recomputeVirtualRowsOnly(): void {
    this.virtualRows = GroupingEngine.projectVirtualRows(
      this.processedData,
      this.currentGroups,
      this.expandedGroupKeys
    );
    this.emit('loaded');
  }
}
