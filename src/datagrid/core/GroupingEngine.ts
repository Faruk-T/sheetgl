import { GroupDescriptor, VirtualRow } from '../types/group';

export class GroupingEngine {
  public static projectVirtualRows(
    data: any[],
    groups: GroupDescriptor[],
    expandedKeys: Set<string>,
    summariesFields?: string[]
  ): VirtualRow[] {
    if (!groups || groups.length === 0) {
      // Gruplama yoksa düz satırlar
      return data.map((item, rawIndex) => ({
        type: 'data',
        rawIndex,
        data: item,
      }));
    }

    const result: VirtualRow[] = [];
    this.groupRecursive(data, groups, 0, '', expandedKeys, result, summariesFields);
    return result;
  }

  private static groupRecursive(
    items: any[],
    groups: GroupDescriptor[],
    level: number,
    parentKey: string,
    expandedKeys: Set<string>,
    out: VirtualRow[],
    summariesFields?: string[]
  ): void {
    if (level >= groups.length) {
      // En alt seviye yaprak veriler
      for (const item of items) {
        out.push({
          type: 'data',
          rawIndex: item.__rawIndex ?? 0,
          data: item,
        });
      }
      return;
    }

    const currentGroup = groups[level];
    const field = currentGroup.selector;

    // Satırları gruplara ayır
    const buckets = new Map<any, any[]>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const val = item[field] ?? '(Boş)';
      let bucket = buckets.get(val);
      if (!bucket) {
        bucket = [];
        buckets.set(val, bucket);
      }
      bucket.push(item);
    }

    // Her grubu sanal satır olarak ekle
    for (const [val, bucketItems] of buckets.entries()) {
      const groupKey = parentKey ? `${parentKey}|${field}:${val}` : `${field}:${val}`;
      const isExpanded = expandedKeys.has(groupKey);

      // Grup içi toplamları hesapla
      const summaries: Record<string, number> = {};
      if (summariesFields && summariesFields.length > 0) {
        for (const sf of summariesFields) {
          let sum = 0;
          let count = 0;
          for (const bi of bucketItems) {
            const num = Number(bi[sf]);
            if (!isNaN(num)) {
              sum += num;
              count++;
            }
          }
          summaries[sf] = sum;
        }
      }

      out.push({
        type: 'group',
        level,
        groupKey,
        field,
        value: val,
        rowCount: bucketItems.length,
        isExpanded,
        summaries,
      });

      // Eğer grup açıksa çocuklarını da ekle
      if (isExpanded) {
        this.groupRecursive(bucketItems, groups, level + 1, groupKey, expandedKeys, out, summariesFields);
      }
    }
  }
}
