import React, { useEffect, useRef, useState } from 'react';
import { CellEditorProps } from '../../IColumnTypePlugin';
import { normalizeObjectValue } from './ObjectPainter';

interface KeyValuePair {
  key: string;
  value: string;
}

function parseScalarValue(raw: string): any {
  const trimmed = raw.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed !== '' && !isNaN(Number(trimmed))) return Number(trimmed);
  return raw;
}

export const ObjectEditor: React.FC<CellEditorProps<Record<string, any>>> = ({
  value,
  column,
  rect,
  theme,
  locale,
  onCommit,
  onCancel,
}) => {
  const initialObj = normalizeObjectValue(value);
  const [mode, setMode] = useState<'kv' | 'json'>('kv');
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => {
    const entries = Object.entries(initialObj);
    return entries.length > 0
      ? entries.map(([k, v]) => ({
          key: k,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
        }))
      : [{ key: 'key', value: '' }];
  });
  const [jsonText, setJsonText] = useState<string>(() => JSON.stringify(initialObj, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isTR = locale?.code?.startsWith('tr');

  const buildObjectFromPairs = (list: KeyValuePair[]): Record<string, any> => {
    const out: Record<string, any> = {};
    for (const item of list) {
      const k = item.key.trim();
      if (!k) continue;
      out[k] = parseScalarValue(item.value);
    }
    return out;
  };

  const handleSave = (moveDir: 'down' | 'right' | 'left' | 'none' = 'none') => {
    if (mode === 'json') {
      try {
        const parsed = JSON.parse(jsonText || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          setJsonError(isTR ? 'Geçerli bir JSON nesnesi ({...}) girin' : 'Must be a valid JSON object ({...})');
          return;
        }
        onCommit(parsed, moveDir);
      } catch (err: any) {
        setJsonError(err?.message || 'Invalid JSON');
      }
    } else {
      onCommit(buildObjectFromPairs(pairs), moveDir);
    }
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave('none');
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  });

  const switchMode = (nextMode: 'kv' | 'json') => {
    if (nextMode === mode) return;
    if (nextMode === 'json') {
      const obj = buildObjectFromPairs(pairs);
      setJsonText(JSON.stringify(obj, null, 2));
      setJsonError(null);
      setMode('json');
    } else {
      try {
        const parsed = JSON.parse(jsonText || '{}');
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setPairs(
            Object.entries(parsed).map(([k, v]) => ({
              key: k,
              value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
            }))
          );
          setJsonError(null);
          setMode('kv');
        }
      } catch {
        setJsonError(isTR ? 'JSON hatası düzeltilmeden geçiş yapılamaz' : 'Fix JSON syntax error first');
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleSave('down');
        }
      }}
      style={{
        position: 'absolute',
        left: Math.max(4, rect.x),
        top: rect.y,
        width: Math.max(rect.width, 320),
        zIndex: 130,
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
      {/* Header & Mode Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderBottom: `1px solid ${theme.dom.popoverBorder}`,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
          <span style={{ color: theme.dom.accentColor, fontFamily: 'monospace' }}>{'{ }'}</span>
          <span>{column.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => switchMode('kv')}
            style={{
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 5,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mode === 'kv' ? theme.dom.accentColor : 'transparent',
              color: mode === 'kv' ? '#FFFFFF' : theme.dom.popoverText,
            }}
          >
            Key-Value
          </button>
          <button
            type="button"
            onClick={() => switchMode('json')}
            style={{
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 5,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mode === 'json' ? theme.dom.accentColor : 'transparent',
              color: mode === 'json' ? '#FFFFFF' : theme.dom.popoverText,
            }}
          >
            JSON
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 10, maxHeight: 230, overflowY: 'auto' }}>
        {mode === 'kv' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pairs.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="text"
                  value={p.key}
                  placeholder="key"
                  onChange={(e) => {
                    const next = [...pairs];
                    next[idx] = { ...next[idx], key: e.target.value };
                    setPairs(next);
                  }}
                  style={{
                    width: 100,
                    padding: '5px 7px',
                    borderRadius: 5,
                    border: `1px solid ${theme.dom.inputBorder}`,
                    backgroundColor: theme.dom.inputBg,
                    color: theme.dom.accentColor,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
                <span style={{ color: '#8E8E93', fontWeight: 700 }}>:</span>
                <input
                  type="text"
                  value={p.value}
                  placeholder="value"
                  onChange={(e) => {
                    const next = [...pairs];
                    next[idx] = { ...next[idx], value: e.target.value };
                    setPairs(next);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSave('down');
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 7px',
                    borderRadius: 5,
                    border: `1px solid ${theme.dom.inputBorder}`,
                    backgroundColor: theme.dom.inputBg,
                    color: theme.dom.inputText,
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPairs((prev) => prev.filter((_, i) => i !== idx))}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: '2px 4px',
                  }}
                  title={isTR ? 'Alanı Sil' : 'Remove Field'}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPairs((prev) => [...prev, { key: '', value: '' }])}
              style={{
                alignSelf: 'flex-start',
                marginTop: 4,
                padding: '4px 9px',
                borderRadius: 5,
                border: `1px dashed ${theme.dom.popoverBorder}`,
                backgroundColor: 'transparent',
                color: theme.dom.accentColor,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + {isTR ? 'Alan Ekle (Key-Value)' : 'Add Property'}
            </button>
          </div>
        ) : (
          <div>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setJsonError(null);
              }}
              rows={6}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: `1px solid ${jsonError ? '#EF4444' : theme.dom.inputBorder}`,
                backgroundColor: theme.dom.inputBg,
                color: theme.dom.inputText,
                fontFamily: 'monospace',
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
            {jsonError && (
              <div style={{ color: '#EF4444', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                ⚠ {jsonError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 10px',
          borderTop: `1px solid ${theme.dom.popoverBorder}`,
        }}
      >
        <span style={{ fontSize: 10.5, color: '#8E8E93' }}>
          {isTR ? 'Ctrl+Enter ile kaydet' : 'Ctrl+Enter to save'}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '4px 10px',
              fontSize: 11,
              borderRadius: 5,
              border: `1px solid ${theme.dom.popoverBorder}`,
              backgroundColor: 'transparent',
              color: theme.dom.popoverText,
              cursor: 'pointer',
            }}
          >
            {isTR ? 'İptal' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('none')}
            style={{
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 5,
              border: 'none',
              backgroundColor: theme.dom.accentColor,
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            {isTR ? 'Uygula' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};
