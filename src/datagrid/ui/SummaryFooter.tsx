import React, { useState } from 'react';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { ColumnDef } from '../types/grid';
import { SummaryType } from '../types/group';
import { IGridLocale } from '../i18n/IGridLocale';

export interface SelectionSummaryStats {
  count: number;
  numericCount: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

export interface SummaryFooterProps {
  summaries?: Record<string, number>;
  summaryTypes?: Record<string, SummaryType>;
  onChangeSummaryType?: (columnId: string, summaryType: SummaryType) => void;
  selectionStats?: SelectionSummaryStats | null;
  columns: ColumnDef[];
  theme: IGridThemeTokens;
  locale: IGridLocale;
  totalRowCount: number;
}

export const SummaryFooter: React.FC<SummaryFooterProps> = ({
  summaries,
  summaryTypes = {},
  onChangeSummaryType,
  selectionStats,
  columns,
  theme,
  locale,
  totalRowCount,
}) => {
  const [openConfigCol, setOpenConfigCol] = useState<string | null>(null);
  const [showAddSummary, setShowAddSummary] = useState<boolean>(false);
  const isTR = locale.code.startsWith('tr');

  const formatSummaryVal = (colId: string, val: number, sType: SummaryType): string => {
    if (sType === 'count') {
      return val.toLocaleString(locale.code);
    }
    const col = columns.find((c) => c.id === colId);
    const formattedNum = val.toLocaleString(locale.code, {
      minimumFractionDigits: col?.type === 'currency' ? 2 : 0,
      maximumFractionDigits: 2,
    });
    if (col?.type === 'currency') {
      return `${col.currencySymbol || '$'}${formattedNum}`;
    }
    if (col?.type === 'progress') {
      return `${formattedNum}%`;
    }
    return formattedNum;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        backgroundColor: theme.canvas.rowNumberBg,
        borderTop: `1px solid ${theme.canvas.gridLine}`,
        color: theme.dom.toolbarText,
        fontFamily: theme.fontFamily,
        fontSize: 11,
        userSelect: 'none',
        position: 'relative',
        zIndex: 130,
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      {/* Left: Total Records + Live Excel Range Selection Aggregations */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>
          {locale.totalRecords}: <strong>{totalRowCount.toLocaleString(locale.code)}</strong>
        </span>

        {selectionStats && selectionStats.count > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '2px 8px',
              borderRadius: 6,
              backgroundColor: theme.isDark ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)',
              border: `1px solid ${theme.isDark ? 'rgba(10,132,255,0.35)' : 'rgba(0,122,255,0.25)'}`,
              color: theme.dom.accentColor,
              fontWeight: 600,
            }}
          >
            <span>
              {isTR ? 'Seçim' : 'Selected'} ({selectionStats.count}):
            </span>
            {selectionStats.numericCount > 0 && (
              <>
                <span>
                  SUM:{' '}
                  <strong>
                    {selectionStats.sum.toLocaleString(locale.code, { maximumFractionDigits: 2 })}
                  </strong>
                </span>
                <span>
                  AVG:{' '}
                  <strong>
                    {selectionStats.avg.toLocaleString(locale.code, { maximumFractionDigits: 2 })}
                  </strong>
                </span>
                <span>
                  MIN:{' '}
                  <strong>
                    {selectionStats.min.toLocaleString(locale.code, { maximumFractionDigits: 2 })}
                  </strong>
                </span>
                <span>
                  MAX:{' '}
                  <strong>
                    {selectionStats.max.toLocaleString(locale.code, { maximumFractionDigits: 2 })}
                  </strong>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right: Configurable Column Summaries */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {summaries &&
          Object.entries(summaries).map(([field, sumVal]) => {
            const col = columns.find((c) => c.id === field);
            const sType = summaryTypes[field] || 'sum';
            const isOpen = openConfigCol === field;

            return (
              <div key={field} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setOpenConfigCol(isOpen ? null : field)}
                  title={isTR ? 'Özet tipini değiştirmek için tıklayın' : 'Click to change summary aggregation'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '2px 8px',
                    borderRadius: 6,
                    border: `1px solid ${isOpen ? theme.dom.accentColor : theme.canvas.gridLine}`,
                    backgroundColor: theme.canvas.bg,
                    color: theme.canvas.cellText,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: theme.fontFamily,
                  }}
                >
                  <span style={{ color: theme.isDark ? '#98989D' : '#6E6E73' }}>
                    {col?.title || field}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      padding: '1px 4px',
                      borderRadius: 3,
                      backgroundColor: theme.dom.badgeBg,
                      color: theme.dom.badgeText,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {sType}
                  </span>
                  <strong>{formatSummaryVal(field, sumVal, sType)}</strong>
                </button>

                {isOpen && onChangeSummaryType && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 6px)',
                      right: 0,
                      width: 150,
                      padding: 6,
                      backgroundColor: theme.dom.popoverBg,
                      color: theme.dom.popoverText,
                      border: `1px solid ${theme.dom.popoverBorder}`,
                      borderRadius: 8,
                      boxShadow: theme.dom.popoverShadow,
                      backdropFilter: theme.dom.glassBackdrop,
                      zIndex: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#8E8E93',
                        padding: '2px 6px 4px',
                        borderBottom: `1px solid ${theme.dom.popoverBorder}`,
                      }}
                    >
                      {col?.title || field}
                    </div>
                    {(['sum', 'avg', 'min', 'max', 'count', 'none'] as SummaryType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          onChangeSummaryType(field, t);
                          setOpenConfigCol(null);
                        }}
                        style={{
                          padding: '4px 8px',
                          textAlign: 'left',
                          fontSize: 11,
                          fontWeight: sType === t ? 700 : 500,
                          border: 'none',
                          borderRadius: 4,
                          backgroundColor:
                            sType === t ? theme.dom.accentColor : 'transparent',
                          color: sType === t ? '#FFFFFF' : theme.dom.popoverText,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {t === 'none' ? (isTR ? '✕ Kaldır (None)' : '✕ Remove (None)') : t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {/* Add / Configure Summary Button */}
        {onChangeSummaryType && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowAddSummary((v) => !v)}
              style={{
                padding: '2px 8px',
                borderRadius: 6,
                border: `1px dashed ${theme.dom.accentColor}`,
                backgroundColor: 'transparent',
                color: theme.dom.accentColor,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: theme.fontFamily,
              }}
            >
              + {isTR ? 'Özet Ayarla' : 'Summaries'}
            </button>

            {showAddSummary && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  right: 0,
                  width: 260,
                  maxHeight: 260,
                  overflowY: 'auto',
                  padding: 10,
                  backgroundColor: theme.dom.popoverBg,
                  color: theme.dom.popoverText,
                  border: `1px solid ${theme.dom.popoverBorder}`,
                  borderRadius: 10,
                  boxShadow: theme.dom.popoverShadow,
                  backdropFilter: theme.dom.glassBackdrop,
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                    paddingBottom: 4,
                    borderBottom: `1px solid ${theme.dom.popoverBorder}`,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 11 }}>
                    {isTR ? 'Dinamik Özet Satırı Ayarları' : 'Configure Summary Aggregations'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddSummary(false)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#8E8E93',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {columns
                  .filter((c) => c.type !== 'sparkline' && c.type !== 'action')
                  .map((col) => {
                    const cur = summaryTypes[col.id] || 'none';
                    return (
                      <div
                        key={col.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 0',
                          fontSize: 11,
                        }}
                      >
                        <span>{col.title}</span>
                        <select
                          value={cur}
                          onChange={(e) =>
                            onChangeSummaryType(col.id, e.target.value as SummaryType)
                          }
                          style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: `1px solid ${theme.dom.inputBorder}`,
                            backgroundColor: theme.dom.inputBg,
                            color: theme.dom.inputText,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          <option value="none">NONE</option>
                          <option value="sum">SUM</option>
                          <option value="avg">AVG</option>
                          <option value="min">MIN</option>
                          <option value="max">MAX</option>
                          <option value="count">COUNT</option>
                        </select>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
