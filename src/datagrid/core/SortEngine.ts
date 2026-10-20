import { SortDescriptor } from '../types/filter';

export class SortEngine {
  private static collator = new Intl.Collator('tr-TR', {
    numeric: true,
    sensitivity: 'base',
  });

  public static createComparator(sortRules: SortDescriptor[]): (a: any, b: any) => number {
    if (!sortRules || sortRules.length === 0) {
      return () => 0;
    }

    return (a: any, b: any) => {
      for (const rule of sortRules) {
        const valA = a?.[rule.selector];
        const valB = b?.[rule.selector];

        const diff = this.compareValues(valA, valB);
        if (diff !== 0) {
          return rule.desc ? -diff : diff;
        }
      }
      return 0;
    };
  }

  public static compareValues(a: any, b: any): number {
    if (a === b) return 0;
    if (a === null || a === undefined || a === '') return 1;
    if (b === null || b === undefined || b === '') return -1;

    // Sayısal karşılaştırma
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    // Tarih karşılaştırması
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    // Boolean karşılaştırması
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b ? 0 : a ? 1 : -1;
    }

    const strA =
      typeof a === 'object' && a !== null
        ? Array.isArray(a)
          ? a.join(', ')
          : JSON.stringify(a)
        : String(a);
    const strB =
      typeof b === 'object' && b !== null
        ? Array.isArray(b)
          ? b.join(', ')
          : JSON.stringify(b)
        : String(b);

    // Metin karşılaştırması (Türkçe ve doğal sayı duyarlı)
    return this.collator.compare(strA, strB);
  }
}
