import { ColumnDef, IDeferred, ValidationRule, ValidationRuleResult } from '../types/grid';
import { FilterEngine } from './FilterEngine';

export interface ValidationOutcome {
  valid: boolean;
  message?: string;
  isAsync?: boolean;
}

/**
 * DevExtreme-compatible Deferred class for asynchronous backend validation.
 * Supports:
 * - `d.resolve(true)` or `d.resolve()` -> Valid
 * - `d.resolve(false)` -> Invalid (displays rule.message)
 * - `d.reject("Custom backend error message")` -> Invalid (displays custom message)
 * - `return d.promise()` or `return d`
 */
export class Deferred<T = ValidationRuleResult> implements IDeferred<T> {
  private _promise: Promise<ValidationRuleResult>;
  private _resolve!: (val: ValidationRuleResult) => void;

  constructor() {
    this._promise = new Promise<ValidationRuleResult>((res) => {
      this._resolve = res;
    });
  }

  public resolve = (result?: T): void => {
    if (result === undefined) {
      this._resolve(true);
    } else {
      this._resolve(result as unknown as ValidationRuleResult);
    }
  };

  public reject = (errorMessage?: string | { valid?: boolean; message?: string }): void => {
    if (typeof errorMessage === 'string' && errorMessage.trim()) {
      this._resolve({ valid: false, message: errorMessage });
    } else if (errorMessage && typeof errorMessage === 'object') {
      this._resolve({ valid: false, message: errorMessage.message });
    } else {
      this._resolve(false);
    }
  };

  public promise = (): Promise<ValidationRuleResult> => {
    return this._promise;
  };
}

export function createDeferred<T = ValidationRuleResult>(): Deferred<T> {
  return new Deferred<T>();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

export class ValidationEngine {
  private static normalizeResult(
    res: ValidationRuleResult,
    fallbackMsg: string
  ): { valid: boolean; message?: string } {
    if (typeof res === 'boolean') {
      return res ? { valid: true } : { valid: false, message: fallbackMsg };
    }
    if (typeof res === 'string') {
      return res.trim() === '' ? { valid: true } : { valid: false, message: res };
    }
    if (res && typeof res === 'object') {
      return {
        valid: Boolean(res.valid),
        message: res.valid ? undefined : res.message || fallbackMsg,
      };
    }
    return { valid: true };
  }

  private static isEmpty(val: any): boolean {
    if (val === null || val === undefined) return true;
    if (typeof val === 'string' && val.trim() === '') return true;
    if (Array.isArray(val) && val.length === 0) return true;
    if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) {
      return true;
    }
    return false;
  }

  public static async validateCell(
    value: any,
    row: Record<string, any>,
    column: ColumnDef,
    isTR: boolean = false
  ): Promise<ValidationOutcome> {
    const colTitle = column.title.replace(' ⚡', '');

    // 1. Evaluate declarative validationRules (static & async)
    if (column.validationRules && column.validationRules.length > 0) {
      for (const rule of column.validationRules) {
        const outcome = await this.evaluateSingleRule(rule, value, row, column, colTitle, isTR);
        if (!outcome.valid) {
          return outcome;
        }
      }
    }

    // 2. Evaluate column.validator callback (supports sync or async Promise)
    if (column.validator) {
      const fallbackMsg = isTR
        ? `${colTitle}: Geçersiz değer!`
        : `${colTitle}: Invalid cell value!`;
      const maybePromise = column.validator(value, row, column);
      const isAsync = maybePromise instanceof Promise;
      const resolved = isAsync ? await maybePromise : maybePromise;
      const norm = this.normalizeResult(resolved, fallbackMsg);
      if (!norm.valid) {
        return { ...norm, isAsync };
      }
    }

    return { valid: true };
  }

  private static async evaluateSingleRule(
    rule: ValidationRule,
    value: any,
    row: Record<string, any>,
    column: ColumnDef,
    colTitle: string,
    isTR: boolean
  ): Promise<ValidationOutcome> {
    switch (rule.type) {
      case 'required': {
        if (this.isEmpty(value)) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR ? `${colTitle} alanı boş bırakılamaz!` : `${colTitle} is required!`),
          };
        }
        return { valid: true };
      }

      case 'range': {
        if (this.isEmpty(value)) return { valid: true };
        const num = FilterEngine.parseNumeric(value);
        if (isNaN(num)) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR ? `${colTitle} geçerli bir sayı olmalıdır!` : `${colTitle} must be a number!`),
          };
        }
        if (rule.min !== undefined && num < rule.min) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR
                ? `${colTitle} en az ${rule.min.toLocaleString('tr-TR')} olmalıdır!`
                : `${colTitle} must be at least ${rule.min.toLocaleString('en-US')}!`),
          };
        }
        if (rule.max !== undefined && num > rule.max) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR
                ? `${colTitle} en fazla ${rule.max.toLocaleString('tr-TR')} olabilir!`
                : `${colTitle} cannot exceed ${rule.max.toLocaleString('en-US')}!`),
          };
        }
        return { valid: true };
      }

      case 'stringLength': {
        if (this.isEmpty(value)) return { valid: true };
        const len = String(value).trim().length;
        if (rule.min !== undefined && len < rule.min) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR
                ? `${colTitle} en az ${rule.min} karakter olmalıdır!`
                : `${colTitle} must be at least ${rule.min} characters!`),
          };
        }
        if (rule.max !== undefined && len > rule.max) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR
                ? `${colTitle} en fazla ${rule.max} karakter olabilir!`
                : `${colTitle} must be at most ${rule.max} characters!`),
          };
        }
        return { valid: true };
      }

      case 'pattern': {
        if (this.isEmpty(value)) return { valid: true };
        const regex =
          typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
        if (!regex.test(String(value).trim())) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR
                ? `${colTitle} beklenen formata uymuyor!`
                : `${colTitle} does not match the required pattern!`),
          };
        }
        return { valid: true };
      }

      case 'email': {
        if (this.isEmpty(value)) return { valid: true };
        if (!EMAIL_REGEX.test(String(value).trim())) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR
                ? `${colTitle}: Geçerli bir e-posta adresi girin!`
                : `${colTitle}: Enter a valid email address!`),
          };
        }
        return { valid: true };
      }

      case 'url': {
        if (this.isEmpty(value)) return { valid: true };
        if (!URL_REGEX.test(String(value).trim())) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR
                ? `${colTitle}: Geçerli bir URL girin!`
                : `${colTitle}: Enter a valid URL!`),
          };
        }
        return { valid: true };
      }

      case 'compare': {
        const target = rule.comparisonTarget(row);
        const op = rule.comparisonType || '==';
        const a = FilterEngine.parseNumeric(value);
        const b = FilterEngine.parseNumeric(target);
        const useNum = !isNaN(a) && !isNaN(b);
        const left = useNum ? a : value;
        const right = useNum ? b : target;

        let ok = true;
        if (op === '==') ok = left === right;
        else if (op === '!=') ok = left !== right;
        else if (op === '<') ok = left < right;
        else if (op === '<=') ok = left <= right;
        else if (op === '>') ok = left > right;
        else if (op === '>=') ok = left >= right;

        if (!ok) {
          return {
            valid: false,
            message:
              rule.message ||
              (isTR
                ? `${colTitle} karşılaştırma kuralını sağlamıyor!`
                : `${colTitle} failed comparison validation!`),
          };
        }
        return { valid: true };
      }

      case 'custom': {
        const fallback =
          rule.message ||
          (isTR ? `${colTitle}: Doğrulama başarısız!` : `${colTitle}: Validation failed!`);
        const deferred = new Deferred<ValidationRuleResult>();
        const res = rule.validationCallback({ value, data: row, column, rule, deferred });
        return this.normalizeResult(res, fallback);
      }

      case 'async': {
        const fallback =
          rule.message ||
          (isTR
            ? `${colTitle}: Asenkron doğrulama başarısız!`
            : `${colTitle}: Async validation failed!`);
        const deferred = new Deferred<ValidationRuleResult>();
        try {
          const rawReturn = rule.validationCallback({ value, data: row, column, rule, deferred });
          let resolved: ValidationRuleResult;
          if (rawReturn && typeof (rawReturn as IDeferred).promise === 'function') {
            resolved = await (rawReturn as IDeferred).promise();
          } else if (rawReturn instanceof Promise) {
            resolved = await rawReturn;
          } else if (rawReturn === undefined) {
            // Developer used params.deferred.resolve(...) without returning
            resolved = await deferred.promise();
          } else {
            resolved = rawReturn as ValidationRuleResult;
          }
          return {
            ...this.normalizeResult(resolved, fallback),
            isAsync: true,
          };
        } catch (err: any) {
          const errMsg =
            typeof err === 'string' && err.trim()
              ? err
              : err && typeof err.message === 'string' && err.message.trim()
              ? err.message
              : fallback;
          return {
            valid: false,
            message: errMsg,
            isAsync: true,
          };
        }
      }

      default:
        return { valid: true };
    }
  }
}
