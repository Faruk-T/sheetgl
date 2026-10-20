import { FilterDescriptor, FilterOperation, SingleFilter } from '../types/filter';

export const BLANK_FILTER_TOKEN = '__SHEETGL_BLANK__';

interface CompiledSetCache {
  rawSet: Set<any>;
  lowerSet: Set<string>;
  hasBlank: boolean;
}

export class FilterEngine {
  private static inSetCache = new WeakMap<any[], CompiledSetCache>();

  private static getCompiledSet(targetVal: any[]): CompiledSetCache {
    let cached = this.inSetCache.get(targetVal);
    if (!cached) {
      const rawSet = new Set<any>();
      const lowerSet = new Set<string>();
      let hasBlank = false;
      for (let i = 0; i < targetVal.length; i++) {
        const t = targetVal[i];
        if (t === BLANK_FILTER_TOKEN || t === '' || t === null || t === undefined) {
          hasBlank = true;
        } else {
          rawSet.add(t);
          if (typeof t === 'string') {
            lowerSet.add(t.toLowerCase());
          } else {
            lowerSet.add(String(t).toLowerCase());
          }
        }
      }
      cached = { rawSet, lowerSet, hasBlank };
      this.inSetCache.set(targetVal, cached);
    }
    return cached;
  }

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

  public static parseNumeric(val: any): number {
    if (typeof val === 'number') return val;
    if (val === null || val === undefined || val === '') return NaN;
    const raw = String(val)
      .replace(/[^0-9.,+-]/g, '')
      .trim();
    if (!raw) return NaN;

    const hasDot = raw.includes('.');
    const hasComma = raw.includes(',');

    if (hasDot && hasComma) {
      if (raw.lastIndexOf(',') > raw.lastIndexOf('.')) {
        // TR/EU format: 15.000,47 -> 15000.47
        return parseFloat(raw.replace(/\./g, '').replace(',', '.'));
      } else {
        // US/UK format: 15,000.47 -> 15000.47
        return parseFloat(raw.replace(/,/g, ''));
      }
    }

    if (hasComma) {
      // Check if multiple commas or 3-digit grouping like 40,000,000
      if (/^[+-]?\d{1,3}(,\d{3}){2,}$/.test(raw)) {
        return parseFloat(raw.replace(/,/g, ''));
      }
      // Decimal comma: 15000,47 -> 15000.47
      return parseFloat(raw.replace(',', '.'));
    }

    if (hasDot) {
      // TR/EU thousands separator without decimals: 15.000 or 400.000 or 1.250.000
      if (/^[+-]?\d{1,3}(\.\d{3})+$/.test(raw)) {
        return parseFloat(raw.replace(/\./g, ''));
      }
      return parseFloat(raw);
    }

    return parseFloat(raw);
  }

  private static stringifyValue(rawVal: any): string {
    if (rawVal === null || rawVal === undefined) return '';
    if (Array.isArray(rawVal)) return rawVal.join(', ');
    if (typeof rawVal === 'object') {
      return Object.entries(rawVal)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(' • ');
    }
    return String(rawVal);
  }

  private static matchesFormattedNumber(numVal: number, targetStr: string, mode: 'contains' | 'startswith' | 'endswith'): boolean {
    const tr2 = numVal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).toLowerCase();
    const tr0 = numVal.toLocaleString('tr-TR').toLowerCase();
    const en2 = numVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).toLowerCase();
    const cleanTarget = targetStr.replace(/[$€₺£%\s]/g, '').trim();
    if (!cleanTarget) return false;

    if (mode === 'contains') {
      return tr2.includes(cleanTarget) || tr0.includes(cleanTarget) || en2.includes(cleanTarget);
    }
    if (mode === 'startswith') {
      return tr2.startsWith(cleanTarget) || tr0.startsWith(cleanTarget) || en2.startsWith(cleanTarget);
    }
    return tr2.endsWith(cleanTarget) || tr0.endsWith(cleanTarget) || en2.endsWith(cleanTarget);
  }

  public static match(rawVal: any, op: FilterOperation, targetVal: any): boolean {
    const isRawBlank =
      rawVal === null ||
      rawVal === undefined ||
      rawVal === '' ||
      (Array.isArray(rawVal) && rawVal.length === 0) ||
      (typeof rawVal === 'object' && !Array.isArray(rawVal) && Object.keys(rawVal).length === 0);

    if (op === 'in') {
      if (!Array.isArray(targetVal) || targetVal.length === 0) return false;
      const compiled = this.getCompiledSet(targetVal);
      if (isRawBlank) return compiled.hasBlank;
      if (Array.isArray(rawVal)) {
        for (let i = 0; i < rawVal.length; i++) {
          const elem = rawVal[i];
          if (compiled.rawSet.has(elem) || compiled.lowerSet.has(String(elem).toLowerCase())) {
            return true;
          }
        }
        return false;
      }
      if (compiled.rawSet.has(rawVal)) return true;
      return compiled.lowerSet.has(this.stringifyValue(rawVal).toLowerCase());
    }

    if (op === 'notin') {
      if (!Array.isArray(targetVal) || targetVal.length === 0) return true;
      const compiled = this.getCompiledSet(targetVal);
      if (isRawBlank) return !compiled.hasBlank;
      if (Array.isArray(rawVal)) {
        for (let i = 0; i < rawVal.length; i++) {
          const elem = rawVal[i];
          if (compiled.rawSet.has(elem) || compiled.lowerSet.has(String(elem).toLowerCase())) {
            return false;
          }
        }
        return true;
      }
      if (compiled.rawSet.has(rawVal)) return false;
      return !compiled.lowerSet.has(this.stringifyValue(rawVal).toLowerCase());
    }

    if (op === '=' && (targetVal === null || targetVal === undefined || targetVal === '' || targetVal === BLANK_FILTER_TOKEN)) {
      return isRawBlank;
    }

    if (isRawBlank) {
      return op === '<>' || op === 'notcontains';
    }

    const valStr = this.stringifyValue(rawVal).toLowerCase();
    const targetStr = String(targetVal ?? '').toLowerCase().trim();
    const numRaw = typeof rawVal === 'number' ? rawVal : this.parseNumeric(rawVal);
    const numTarget = this.parseNumeric(targetVal);
    const bothNumeric = typeof rawVal === 'number' && !isNaN(numTarget);

    switch (op) {
      case 'contains':
        if (valStr.includes(targetStr)) return true;
        if (typeof rawVal === 'number') {
          return this.matchesFormattedNumber(rawVal, targetStr, 'contains');
        }
        return false;
      case 'notcontains':
        if (valStr.includes(targetStr)) return false;
        if (typeof rawVal === 'number' && this.matchesFormattedNumber(rawVal, targetStr, 'contains')) {
          return false;
        }
        return true;
      case 'startswith':
        if (valStr.startsWith(targetStr)) return true;
        if (typeof rawVal === 'number') {
          return this.matchesFormattedNumber(rawVal, targetStr, 'startswith');
        }
        return false;
      case 'endswith':
        if (valStr.endsWith(targetStr)) return true;
        if (typeof rawVal === 'number') {
          return this.matchesFormattedNumber(rawVal, targetStr, 'endswith');
        }
        return false;
      case '=':
        if (bothNumeric) {
          return Math.abs(numRaw - numTarget) < 0.0001;
        }
        if (typeof rawVal === 'boolean') {
          if (typeof targetVal === 'boolean') return rawVal === targetVal;
          const bTarget = ['true', '1', 'evet', 'doğru', 'yes'].includes(targetStr);
          return rawVal === bTarget;
        }
        return valStr === targetStr;
      case '<>':
        if (bothNumeric) {
          return Math.abs(numRaw - numTarget) >= 0.0001;
        }
        return valStr !== targetStr;
      case '<':
        if (bothNumeric) return numRaw < numTarget;
        return valStr < targetStr;
      case '<=':
        if (bothNumeric) return numRaw <= numTarget;
        return valStr <= targetStr;
      case '>':
        if (bothNumeric) return numRaw > numTarget;
        return valStr > targetStr;
      case '>=':
        if (bothNumeric) return numRaw >= numTarget;
        return valStr >= targetStr;
      case 'between': {
        const [minRaw, maxRaw] = Array.isArray(targetVal) ? targetVal : [0, 0];
        const minNum = this.parseNumeric(minRaw);
        const maxNum = this.parseNumeric(maxRaw);
        if (typeof rawVal === 'number' && !isNaN(minNum) && !isNaN(maxNum)) {
          const lo = Math.min(minNum, maxNum);
          const hi = Math.max(minNum, maxNum);
          return rawVal >= lo && rawVal <= hi;
        }
        const minS = String(minRaw ?? '').toLowerCase().trim();
        const maxS = String(maxRaw ?? '').toLowerCase().trim();
        return valStr >= minS && valStr <= maxS;
      }
      default:
        return true;
    }
  }

  public static buildRowSearchIndex(row: Record<string, any>): string {
    const parts: string[] = [];
    for (const k in row) {
      if (k.startsWith('__') || k === 'sparkline') continue;
      const v = row[k];
      if (v !== null && v !== undefined && v !== '') {
        parts.push(this.stringifyValue(v));
      }
    }
    const idx = parts.join('\x1f').toLowerCase();
    row.__searchIndex = idx;
    return idx;
  }

  public static matchSearch(row: Record<string, any>, cleanKeyword: string): boolean {
    if (!cleanKeyword) return true;
    const indexStr: string = row.__searchIndex ?? this.buildRowSearchIndex(row);
    return indexStr.includes(cleanKeyword);
  }
}
