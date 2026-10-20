import { FilterDescriptor, FilterOperation, SingleFilter } from '../types/filter';

export class FilterEngine {
  public static evaluateRow(row: Record<string, any>, filter: FilterDescriptor | null): boolean {
    if (!filter || !Array.isArray(filter) || filter.length === 0) {
      return true;
    }

    // Tekil filtre kontrolü: [column, operator, value]
    if (this.isSingleFilter(filter)) {
      return this.evaluateSingleFilter(row, filter as SingleFilter);
    }

    // Bileşik filtre kontrolü: [filter1, "and"|"or", filter2, ...]
    let logicalOp: 'and' | 'or' = 'and';
    let currentResult = true;

    for (let i = 0; i < filter.length; i++) {
      const item = filter[i];

      if (typeof item === 'string') {
        const lower = item.toLowerCase();
        if (lower === 'and' || lower === 'or') {
          logicalOp = lower;
        }
        continue;
      }

      const itemResult = this.evaluateRow(row, item as FilterDescriptor);

      if (i === 0) {
        currentResult = itemResult;
      } else {
        if (logicalOp === 'and') {
          currentResult = currentResult && itemResult;
          if (!currentResult) return false; // Kısa devre (Short-circuit)
        } else {
          currentResult = currentResult || itemResult;
          if (currentResult) return true; // Kısa devre
        }
      }
    }

    return currentResult;
  }

  private static isSingleFilter(filter: any[]): boolean {
    return (
      filter.length === 3 &&
      typeof filter[0] === 'string' &&
      typeof filter[1] === 'string' &&
      !['and', 'or'].includes(filter[1].toLowerCase())
    );
  }

  private static evaluateSingleFilter(row: Record<string, any>, [field, op, targetVal]: SingleFilter): boolean {
    const rawVal = row[field];
    return this.match(rawVal, op, targetVal);
  }

  public static match(rawVal: any, op: FilterOperation, targetVal: any): boolean {
    if (op === '=' && (targetVal === null || targetVal === undefined || targetVal === '')) {
      return rawVal === null || rawVal === undefined || rawVal === '';
    }

    if (rawVal === null || rawVal === undefined) {
      return op === '<>';
    }

    const valStr = String(rawVal).toLowerCase();
    const targetStr = String(targetVal ?? '').toLowerCase();

    switch (op) {
      case 'contains':
        return valStr.includes(targetStr);
      case 'notcontains':
        return !valStr.includes(targetStr);
      case 'startswith':
        return valStr.startsWith(targetStr);
      case 'endswith':
        return valStr.endsWith(targetStr);
      case '=':
        if (typeof rawVal === 'number' || !isNaN(Number(targetVal))) {
          return Number(rawVal) === Number(targetVal);
        }
        if (typeof rawVal === 'boolean') {
          return Boolean(rawVal) === Boolean(targetVal);
        }
        return valStr === targetStr;
      case '<>':
        return valStr !== targetStr;
      case '<':
        return Number(rawVal) < Number(targetVal);
      case '<=':
        return Number(rawVal) <= Number(targetVal);
      case '>':
        return Number(rawVal) > Number(targetVal);
      case '>=':
        return Number(rawVal) >= Number(targetVal);
      case 'between': {
        const [min, max] = Array.isArray(targetVal) ? targetVal : [0, 0];
        const num = Number(rawVal);
        return num >= Number(min) && num <= Number(max);
      }
      case 'in': {
        if (!Array.isArray(targetVal)) return false;
        return targetVal.some((t) => String(t).toLowerCase() === valStr);
      }
      case 'notin': {
        if (!Array.isArray(targetVal)) return true;
        return !targetVal.some((t) => String(t).toLowerCase() === valStr);
      }
      default:
        return true;
    }
  }

  // Global Arama Eşleşmesi
  public static matchSearch(row: Record<string, any>, keyword: string, columns?: string[]): boolean {
    if (!keyword) return true;
    const cleanKeyword = keyword.toLowerCase().trim();
    if (!cleanKeyword) return true;

    const fields = columns && columns.length > 0 ? columns : Object.keys(row);
    for (const f of fields) {
      const val = row[f];
      if (val !== null && val !== undefined) {
        if (String(val).toLowerCase().includes(cleanKeyword)) {
          return true;
        }
      }
    }
    return false;
  }
}
