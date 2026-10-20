import React from 'react';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { ColumnDef } from '../types/grid';
import { IGridLocale } from '../i18n/IGridLocale';

export interface SummaryFooterProps {
  summaries?: Record<string, number>;
  columns: ColumnDef[];
  theme: IGridThemeTokens;
  locale: IGridLocale;
  totalRowCount: number;
}

export const SummaryFooter: React.FC<SummaryFooterProps> = ({
  summaries,
  theme,
  locale,
  totalRowCount,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        backgroundColor: theme.canvas.rowNumberBg,
        borderTop: `1px solid ${theme.canvas.gridLine}`,
        color: theme.dom.toolbarText,
        fontFamily: theme.fontFamily,
        fontSize: 11,
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>
          {locale.totalRecords}: <strong>{totalRowCount.toLocaleString(locale.code)}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {summaries &&
          Object.entries(summaries).slice(0, 4).map(([field, sumVal]) => (
            <div key={field} style={{ display: 'flex', gap: 4 }}>
              <span style={{ color: theme.isDark ? '#8E8E93' : '#6E6E73' }}>{field}:</span>
              <strong>{sumVal.toLocaleString(locale.code, { maximumFractionDigits: 2 })}</strong>
            </div>
          ))}
      </div>
    </div>
  );
};
