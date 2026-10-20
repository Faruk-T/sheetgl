import { IGridThemeTokens } from './IGridTheme';
import { appleLight } from './presets/appleLight';
import { appleDark } from './presets/appleDark';
import { googleLight } from './presets/googleLight';
import { googleDark } from './presets/googleDark';

export type ThemeInput = 'system' | 'apple-light' | 'apple-dark' | 'google-light' | 'google-dark' | IGridThemeTokens;

export class ThemeEngine {
  private static presets: Map<string, IGridThemeTokens> = new Map([
    ['apple-light', appleLight],
    ['apple-dark', appleDark],
    ['google-light', googleLight],
    ['google-dark', googleDark],
  ]);

  public static registerPreset(name: string, tokens: IGridThemeTokens): void {
    this.presets.set(name, tokens);
  }

  public static resolve(themeInput?: ThemeInput): IGridThemeTokens {
    if (!themeInput || themeInput === 'system') {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? appleDark : appleLight;
    }

    if (typeof themeInput === 'string') {
      const found = this.presets.get(themeInput);
      if (found) return found;
      return appleLight;
    }

    return themeInput;
  }

  public static applyToElement(el: HTMLElement, theme: IGridThemeTokens): void {
    const s = el.style;
    s.setProperty('--grid-font-family', theme.fontFamily);
    s.setProperty('--grid-font-size', `${theme.fontSize}px`);
    s.setProperty('--grid-header-font-size', `${theme.headerFontSize}px`);

    // DOM renkleri
    s.setProperty('--grid-toolbar-bg', theme.dom.toolbarBg);
    s.setProperty('--grid-toolbar-border', theme.dom.toolbarBorder);
    s.setProperty('--grid-toolbar-text', theme.dom.toolbarText);
    s.setProperty('--grid-glass-backdrop', theme.dom.glassBackdrop);
    s.setProperty('--grid-popover-bg', theme.dom.popoverBg);
    s.setProperty('--grid-popover-border', theme.dom.popoverBorder);
    s.setProperty('--grid-popover-shadow', theme.dom.popoverShadow);
    s.setProperty('--grid-popover-text', theme.dom.popoverText);
    s.setProperty('--grid-input-bg', theme.dom.inputBg);
    s.setProperty('--grid-input-text', theme.dom.inputText);
    s.setProperty('--grid-input-border', theme.dom.inputBorder);
    s.setProperty('--grid-input-focus-border', theme.dom.inputFocusBorder);
    s.setProperty('--grid-accent-color', theme.dom.accentColor);
    s.setProperty('--grid-button-hover-bg', theme.dom.buttonHoverBg);
    s.setProperty('--grid-badge-bg', theme.dom.badgeBg);
    s.setProperty('--grid-badge-text', theme.dom.badgeText);
  }

  public static watchSystem(onChange: (isDark: boolean) => void): () => void {
    if (typeof window === 'undefined' || !window.matchMedia) return () => {};
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => onChange(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }
}
