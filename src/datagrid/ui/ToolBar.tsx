import React from 'react';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { ThemeInput } from '../theme/ThemeEngine';
import { IGridLocale } from '../i18n/IGridLocale';

export interface ToolBarProps {
  rowCount: number;
  columnCount: number;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  currentThemeName: string;
  onThemeChange: (theme: ThemeInput) => void;
  onLocaleChange?: (localeCode: string) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onExportCsv: () => void;
  groups: string[];
  onToggleGroupColumn: (colId: string) => void;
  availableColumns: Array<{ id: string; title: string }>;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  rowCount,
  columnCount,
  theme,
  locale,
  currentThemeName,
  onThemeChange,
  onLocaleChange,
  searchKeyword,
  onSearchChange,
  onExportCsv,
  groups,
  onToggleGroupColumn,
  availableColumns,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: theme.dom.toolbarBg,
        borderBottom: `1px solid ${theme.dom.toolbarBorder}`,
        color: theme.dom.toolbarText,
        backdropFilter: theme.dom.glassBackdrop,
        fontFamily: theme.fontFamily,
        fontSize: 12,
        userSelect: 'none',
        gap: 12,
      }}
    >
      {/* Sol Alan: Logo, Başlık ve İstatistik Rozetleri */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: theme.isDark ? '#30D158' : '#34C759',
            }}
          />
          <span>SheetGL Pro</span>
        </div>

        <span
          style={{
            padding: '2px 8px',
            backgroundColor: theme.dom.badgeBg,
            color: theme.dom.badgeText,
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {rowCount.toLocaleString(locale.code)} {locale.rows} × {columnCount} {locale.columns}
        </span>
      </div>

      {/* Center: Search & Group Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 420 }}>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={locale.searchPlaceholder}
          style={{
            flex: 1,
            padding: '5px 10px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 6,
            outline: 'none',
            fontSize: 12,
            fontFamily: theme.fontFamily,
          }}
        />

        {/* Grouping Quick Selector */}
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) onToggleGroupColumn(e.target.value);
          }}
          style={{
            padding: '5px 8px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 6,
            outline: 'none',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          <option value="">+ {locale.addGroup}</option>
          {availableColumns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} {groups.includes(c.id) ? '✓' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Language, Theme & Export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onLocaleChange && (
          <select
            value={locale.code}
            onChange={(e) => onLocaleChange(e.target.value)}
            style={{
              padding: '4px 8px',
              backgroundColor: theme.dom.inputBg,
              color: theme.dom.inputText,
              border: `1px solid ${theme.dom.inputBorder}`,
              borderRadius: 6,
              outline: 'none',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="en-US">English (US)</option>
            <option value="tr-TR">Türkçe (TR)</option>
          </select>
        )}

        <select
          value={currentThemeName}
          onChange={(e) => onThemeChange(e.target.value as ThemeInput)}
          style={{
            padding: '4px 8px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 6,
            outline: 'none',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          <option value="apple-light">Apple Light</option>
          <option value="apple-dark">Apple Dark</option>
          <option value="google-light">Google Light</option>
          <option value="google-dark">Google Dark</option>
          <option value="system">{locale.systemTheme}</option>
        </select>

        <button
          onClick={onExportCsv}
          style={{
            padding: '5px 12px',
            backgroundColor: theme.dom.accentColor,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {locale.exportCsv}
        </button>
      </div>
    </div>
  );
};
