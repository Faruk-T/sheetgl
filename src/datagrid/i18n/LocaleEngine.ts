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

  public static resolve(input?: LocaleInput): IGridLocale {
    if (!input) return enUS;

    if (typeof input === 'string') {
      return this.locales.get(input) || enUS;
    }

    // Kullanıcı kısmi (partial) bir nesne verdiyse varsayılan enUS üzerine merge et
    return {
      ...enUS,
      ...input,
    };
  }
}
