import React from 'react';
import { DocThemeColors } from '../types';

export interface SimpleTableProps {
  headers: string[];
  rows: string[][];
  colors: DocThemeColors;
}

export const SimpleTable: React.FC<SimpleTableProps> = ({ headers, rows, colors }) => (
  <div
    style={{
      margin: '16px 0 24px',
      borderRadius: 12,
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
    }}
  >
    <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ backgroundColor: colors.surfaceAlt }}>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                textAlign: 'left',
                padding: '13px 16px',
                fontWeight: 700,
                color: colors.text,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr
            key={ri}
            style={{
              borderBottom: ri < rows.length - 1 ? `1px solid ${colors.border}` : 'none',
            }}
          >
            {r.map((cell, ci) => (
              <td
                key={ci}
                style={{
                  padding: '12px 16px',
                  fontFamily: ci === 0 ? "'JetBrains Mono', monospace" : 'inherit',
                  fontWeight: ci === 0 ? 600 : 400,
                  fontSize: ci === 0 ? 13.5 : 14.5,
                  color: ci === 0 ? colors.accent : colors.text,
                  lineHeight: 1.55,
                  verticalAlign: 'top',
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
