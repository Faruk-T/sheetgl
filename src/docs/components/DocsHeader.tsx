import React from 'react';
import { SheetGLLogo } from '../../datagrid/ui/SheetGLLogo';
import { MaterialIcon } from '../../datagrid/ui/MaterialIcon';
import { DocThemeColors } from '../types';

export interface DocsHeaderProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
  onGoLanding: () => void;
  onGoStudio: () => void;
  onToggleLang: () => void;
  onToggleTheme: () => void;
}

export const DocsHeader: React.FC<DocsHeaderProps> = ({
  isDark,
  isTR,
  colors,
  onGoLanding,
  onGoStudio,
  onToggleLang,
  onToggleTheme,
}) => {
  return (
    <header
      style={{
        height: 60,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.sidebarBg,
        borderBottom: `1px solid ${colors.border}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          onClick={onGoLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          <SheetGLLogo size={28} />
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
            SheetGL <span style={{ color: colors.accent }}>Docs</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onGoLanding}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 7,
            border: `1px solid ${colors.border}`,
            backgroundColor: 'transparent',
            color: colors.muted,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <MaterialIcon name="home" size={16} color={colors.muted} />
          <span>{isTR ? 'Ana Sayfa' : 'Home'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={onToggleLang}
          style={{
            padding: '6px 12px',
            borderRadius: 7,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isTR ? 'TR' : 'EN'}
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 7,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <MaterialIcon name={isDark ? 'light_mode' : 'dark_mode'} size={16} color={colors.accent} />
          <span>{isDark ? (isTR ? 'Açık' : 'Light') : isTR ? 'Koyu' : 'Dark'}</span>
        </button>

        <button
          type="button"
          onClick={onGoStudio}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)',
            color: '#FFFFFF',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <MaterialIcon name="rocket_launch" size={16} color="#FFFFFF" />
          <span>{isTR ? 'Canlı Demo (10K Satır)' : 'Full Demo (10K Rows)'}</span>
        </button>
      </div>
    </header>
  );
};
