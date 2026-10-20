import { FilterDescriptor, FilterOperation, SingleFilter } from '../types/filter';

export const BLANK_FILTER_TOKEN = '__SHEETGL_BLANK__';

export class FilterEngine {
  public static evaluateRow(row: Record<string, any>, filter: FilterDescriptor | null): boolean {
    if (!filter || !Array.isArray(filter) || filter.length === 0) {
      return true;
    }

    if (this.isSingleFilter(filter)) {
      return this.evaluateSingleFilter(row, filter as SingleFilter);
    }

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
          if (!currentResult) return false;
        } else {
          currentResult = currentResult || itemResult;
          if (currentResult) return true;
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
    const isRawBlank =
      rawVal === null ||
      rawVal === undefined ||
      rawVal === '' ||
      (Array.isArray(rawVal) && rawVal.length === 0);

    if (op === 'in') {
      if (!Array.isArray(targetVal)) return false;
      if (targetVal.length === 0) return false;
      if (isRawBlank) {
        return targetVal.includes(BLANK_FILTER_TOKEN) || targetVal.includes('') || targetVal.includes(null);
      }
      if (Array.isArray(rawVal)) {
        const joined = rawVal.join(', ').toLowerCase();
        return targetVal.some(
          (t) =>
            String(t).toLowerCase() === joined ||
            rawVal.some((elem) => elem === t || String(elem).toLowerCase() === String(t).toLowerCase())
        );
      }
      const valStr = String(rawVal).toLowerCase();
      return targetVal.some((t) => t === rawVal || String(t).toLowerCase() === valStr);
    }

    if (op === 'notin') {
      if (!Array.isArray(targetVal)) return true;
      if (isRawBlank) {
        return !(targetVal.includes(BLANK_FILTER_TOKEN) || targetVal.includes('') || targetVal.includes(null));
      }
      if (Array.isArray(rawVal)) {
        const joined = rawVal.join(', ').toLowerCase();
        return !targetVal.some(
          (t) =>
            String(t).toLowerCase() === joined ||
            rawVal.some((elem) => elem === t || String(elem).toLowerCase() === String(t).toLowerCase())
        );
      }
      const valStr = String(rawVal).toLowerCase();
      return !targetVal.some((t) => t === rawVal || String(t).toLowerCase() === valStr);
    }

    if (op === '=' && (targetVal === null || targetVal === undefined || targetVal === '' || targetVal === BLANK_FILTER_TOKEN)) {
      return isRawBlank;
    }

    if (isRawBlank) {
      return op === '<>' || op === 'notcontains';
    }

    const valStr = Array.isArray(rawVal) ? rawVal.join(', ').toLowerCase() : String(rawVal).toLowerCase();
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
        if (typeof rawVal === 'number' && targetVal !== '' && !isNaN(Number(targetVal))) {
          return Number(rawVal) === Number(targetVal);
        }
        if (typeof rawVal === 'boolean') {
          if (typeof targetVal === 'boolean') return rawVal === targetVal;
          return String(rawVal).toLowerCase() === targetStr;
        }
        return valStr === targetStr;
      case '<>':
        if (typeof rawVal === 'number' && targetVal !== '' && !isNaN(Number(targetVal))) {
          return Number(rawVal) !== Number(targetVal);
        }
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
      default:
        return true;
    }
  }

  public static matchSearch(row: Record<string, any>, keyword: string, columns?: string[]): boolean {
    if (!keyword) return true;
    const cleanKeyword = keyword.toLowerCase().trim();
    if (!cleanKeyword) return true;

    const fields = columns && columns.length > 0 ? columns : Object.keys(row);
    for (const f of fields) {
      if (f.startsWith('__')) continue;
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
