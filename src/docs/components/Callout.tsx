import React from 'react';
import { MaterialIcon } from '../../datagrid/ui/MaterialIcon';
import { DocThemeColors } from '../types';

export interface CalloutProps {
  type?: 'info' | 'tip' | 'warning';
  title: string;
  isDark: boolean;
  colors: DocThemeColors;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({
  type = 'info',
  title,
  isDark,
  colors,
  children,
}) => {
  const accentColor =
    type === 'tip' ? '#10B981' : type === 'warning' ? '#F59E0B' : colors.accent;
  const bg =
    type === 'tip'
      ? isDark
        ? 'rgba(16, 185, 129, 0.08)'
        : 'rgba(16, 185, 129, 0.07)'
      : type === 'warning'
      ? isDark
        ? 'rgba(245, 158, 11, 0.09)'
        : 'rgba(245, 158, 11, 0.08)'
      : isDark
      ? 'rgba(56, 189, 248, 0.08)'
      : 'rgba(2, 132, 199, 0.06)';
  const iconName = type === 'tip' ? 'lightbulb' : type === 'warning' ? 'warning' : 'info';

  return (
    <div
      style={{
        margin: '18px 0',
        padding: '16px 20px',
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${accentColor}`,
        backgroundColor: bg,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 700,
          fontSize: 15,
          color: colors.text,
          marginBottom: 6,
        }}
      >
        <MaterialIcon name={iconName} size={18} color={accentColor} />
        <span>{title}</span>
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.65, color: colors.muted }}>{children}</div>
    </div>
  );
};
