import React from 'react';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { ColumnDef } from '../types/grid';

export interface FormulaBarProps {
  activeCoords: { row: number; col: number };
  column?: ColumnDef;
  currentValue: any;
  theme: IGridThemeTokens;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCoords,
  column,
  currentValue,
  theme,
}) => {
  const displayVal =
    currentValue != null
      ? typeof currentValue === 'object'
        ? JSON.stringify(currentValue)
        : String(currentValue)
      : '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 12px',
        backgroundColor: theme.canvas.rowNumberBg,
        borderBottom: `1px solid ${theme.canvas.gridLine}`,
        gap: 8,
        fontFamily: theme.fontFamily,
        fontSize: 12,
        userSelect: 'none',
      }}
    >
      {/* Koordinat Rozeti */}
      <div
        style={{
          padding: '2px 8px',
          backgroundColor: theme.canvas.bg,
          color: theme.dom.accentColor,
          border: `1px solid ${theme.canvas.gridLine}`,
          borderRadius: 4,
          fontFamily: 'monospace',
          fontWeight: 700,
          minWidth: 80,
          textAlign: 'center',
          fontSize: 11,
        }}
      >
        R{activeCoords.row + 1} : C{activeCoords.col + 1}
      </div>

      {/* Sütun Tipi */}
      {column && (
        <span
          style={{
            padding: '2px 6px',
            backgroundColor: theme.dom.badgeBg,
            color: theme.dom.badgeText,
            borderRadius: 4,
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {column.type}
        </span>
      )}

      {/* fx Simgesi */}
      <span style={{ fontWeight: 700, color: theme.isDark ? '#8E8E93' : '#AEAEB2', fontStyle: 'italic' }}>
        fx
      </span>

      {/* Formül / Değer Alanı */}
      <div
        style={{
          flex: 1,
          padding: '3px 8px',
          backgroundColor: theme.canvas.bg,
          color: theme.canvas.cellText,
          border: `1px solid ${theme.canvas.gridLine}`,
          borderRadius: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: 12,
          fontFamily: theme.fontFamily,
        }}
      >
        {displayVal}
      </div>
    </div>
  );
};
