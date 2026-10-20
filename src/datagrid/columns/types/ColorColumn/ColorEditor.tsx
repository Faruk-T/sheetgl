import React, { useEffect, useRef, useState } from 'react';
import { CellEditorProps } from '../../IColumnTypePlugin';

const PRESET_COLORS = [
  '#38BDF8',
  '#2563EB',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F43F5E',
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#10B981',
  '#14B8A6',
];

export const ColorEditor: React.FC<CellEditorProps<string>> = ({
  value,
  rect,
  theme,
  onCommit,
  onCancel,
}) => {
  const [hex, setHex] = useState<string>(String(value || '#38BDF8'));
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCommit(hex, 'none');
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  }, [hex, onCommit]);

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: Math.max(4, rect.x),
        top: rect.y,
        width: 210,
        zIndex: 130,
        padding: 10,
        backgroundColor: theme.dom.popoverBg,
        color: theme.dom.popoverText,
        border: `1px solid ${theme.dom.popoverBorder}`,
        borderRadius: 10,
        boxShadow: theme.dom.popoverShadow,
        backdropFilter: theme.dom.glassBackdrop,
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 6,
          marginBottom: 10,
        }}
      >
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCommit(c, 'none')}
            style={{
              width: 24,
              height: 24,
              borderRadius: 5,
              backgroundColor: c,
              border:
                hex.toLowerCase() === c.toLowerCase()
                  ? '2px solid #FFFFFF'
                  : '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#38BDF8'}
          onChange={(e) => setHex(e.target.value.toUpperCase())}
          style={{ width: 28, height: 28, padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') onCommit(hex, 'down');
            if (e.key === 'Escape') onCancel();
          }}
          style={{
            flex: 1,
            padding: '5px 7px',
            borderRadius: 5,
            border: `1px solid ${theme.dom.inputBorder}`,
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            fontSize: 12,
            fontFamily: 'monospace',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
};
