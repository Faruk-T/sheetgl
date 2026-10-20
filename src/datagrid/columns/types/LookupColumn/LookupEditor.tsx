import React, { useEffect, useRef, useState } from 'react';
import { CellEditorProps } from '../../IColumnTypePlugin';

export const LookupEditor: React.FC<CellEditorProps<string>> = ({
  value,
  column,
  rect,
  theme,
  locale,
  initialChar,
  onCommit,
  onCancel,
}) => {
  const options = column.options || [];
  const [search, setSearch] = useState<string>(initialChar || '');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isTR = locale?.code?.startsWith('tr');

  const filtered = options.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.label.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q) ||
      (o.subtitle && o.subtitle.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  }, [onCancel]);

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: Math.max(4, rect.x),
        top: rect.y,
        minWidth: Math.max(rect.width, 250),
        zIndex: 128,
        backgroundColor: theme.dom.popoverBg,
        color: theme.dom.popoverText,
        border: `1px solid ${theme.dom.popoverBorder}`,
        borderRadius: 10,
        boxShadow: theme.dom.popoverShadow,
        backdropFilter: theme.dom.glassBackdrop,
        overflow: 'hidden',
        fontFamily: theme.fontFamily,
        userSelect: 'none',
      }}
    >
      <div style={{ padding: 8, borderBottom: `1px solid ${theme.dom.popoverBorder}` }}>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setHighlightedIndex(0);
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlightedIndex((p) => Math.min(p + 1, Math.max(0, filtered.length - 1)));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlightedIndex((p) => Math.max(p - 1, 0));
            } else if (e.key === 'Enter' && filtered[highlightedIndex]) {
              e.preventDefault();
              onCommit(filtered[highlightedIndex].value, 'down');
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onCancel();
            }
          }}
          placeholder={isTR ? 'Kayıt, isim veya ID ara...' : 'Search entity, name, or ID...'}
          style={{
            width: '100%',
            padding: '6px 9px',
            borderRadius: 6,
            border: `1px solid ${theme.dom.inputBorder}`,
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ maxHeight: 220, overflowY: 'auto', padding: 4 }}>
        {filtered.map((opt, idx) => {
          const isSelected = String(opt.value) === String(value);
          const isHigh = idx === highlightedIndex;
          return (
            <div
              key={opt.value}
              onClick={() => onCommit(opt.value, 'none')}
              onMouseEnter={() => setHighlightedIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor: isHigh
                  ? theme.isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)'
                  : 'transparent',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{opt.label}</div>
                {opt.subtitle && (
                  <div style={{ fontSize: 11, color: '#8E8E93' }}>{opt.subtitle}</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: 'monospace',
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: theme.dom.badgeBg,
                    color: theme.dom.badgeText,
                  }}
                >
                  {opt.value}
                </span>
                {isSelected && <span style={{ color: theme.dom.accentColor, fontWeight: 700 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
