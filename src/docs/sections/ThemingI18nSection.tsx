import React from 'react';
import { DocThemeColors } from '../types';
import { CodeBlock } from '../components/CodeBlock';

export interface ThemingI18nSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const ThemingI18nSection: React.FC<ThemingI18nSectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  return (
    <div id="thm-code">
      <CodeBlock
        id="theme-i18n-code"
        title="Theme Presets & Custom Token Overrides"
        langBadge="TSX"
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        code={`import { SheetGL, LocaleEngine } from 'sheetgl';

// Auto-detects browser language ('tr' or 'en', defaults to 'en')
const defaultLang = LocaleEngine.detectBrowserLocaleCode();

<SheetGL
  dataSource={rows}
  columns={columns}
  locale={defaultLang === 'tr' ? 'tr-TR' : 'en-US'}
  // Built-in presets: 'apple-dark' | 'apple-light' | 'google-dark' | 'google-light'
  theme={{
    name: 'custom-enterprise',
    isDark: true,
    canvas: {
      bg: '#090D16',
      selectionBorder: '#38BDF8',
    },
  }}
/>`}
      />
    </div>
  );
};
