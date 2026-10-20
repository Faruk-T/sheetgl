import { IGridLocale } from './IGridLocale';
import { enUS } from './locales/enUS';
import { trTR } from './locales/trTR';

export type { IGridLocale };
export type LocaleInput = string | Partial<IGridLocale>;

export class LocaleEngine {
  private static locales: Map<string, IGridLocale> = new Map([
    ['en', enUS],
    ['en-US', enUS],
    ['tr', trTR],
    ['tr-TR', trTR],
  ]);

  public static registerLocale(name: string, locale: IGridLocale): void {
    this.locales.set(name, locale);
  }

  public static detectBrowserLocaleCode(): 'tr' | 'en' {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
    }
    return 'en';
  }

  public static resolve(input?: LocaleInput): IGridLocale {
    if (!input || input === 'auto') {
      const code = this.detectBrowserLocaleCode();
      return this.locales.get(code) || enUS;
    }

    if (typeof input === 'string') {
      const exact = this.locales.get(input);
      if (exact) return exact;
      if (input.toLowerCase().startsWith('tr')) return trTR;
      return enUS;
    }

    return {
      ...enUS,
      ...input,
    };
  }
}
