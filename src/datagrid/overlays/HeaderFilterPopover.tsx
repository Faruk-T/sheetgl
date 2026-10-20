import React, { useEffect, useState } from 'react';
import { ColumnDef } from '../types/grid';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';
import { IDataStore } from '../types/store';
import { DistinctItem } from '../types/filter';

export interface HeaderFilterPopoverProps {
  column: ColumnDef;
  anchorRect: { x: number; y: number; width: number; height: number };
  theme: IGridThemeTokens;
  locale: IGridLocale;
  store: IDataStore;
  activeSelectedValues?: any[];
  onApply: (selectedValues: any[] | null) => void;
  onClose: () => void;
}

export const HeaderFilterPopover: React.FC<HeaderFilterPopoverProps> = ({
  column,
  anchorRect,
  theme,
  locale,
  store,
  activeSelectedValues,
  onApply,
  onClose,
}) => {
  const [items, setItems] = useState<DistinctItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedSet, setSelectedSet] = useState<Set<any>>(
    new Set(activeSelectedValues || [])
  );

  useEffect(() => {
    setLoading(true);
    store.getDistinctValues(column.id, search).then((res) => {
      setItems(res);
      if (!activeSelectedValues) {
        setSelectedSet(new Set(res.map((r) => r.value)));
      }
      setLoading(false);
    });
  }, [column.id, search, store]);

  const toggleAll = () => {
    if (selectedSet.size === items.length) {
      setSelectedSet(new Set());
    } else {
      setSelectedSet(new Set(items.map((i) => i.value)));
    }
  };

  const toggleItem = (val: any) => {
    const next = new Set(selectedSet);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    setSelectedSet(next);
  };

  const handleApply = () => {
    if (selectedSet.size === items.length) {
      onApply(null);
    } else {
      onApply(Array.from(selectedSet));
    }
    onClose();
  };

  const handleClear = () => {
    onApply(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: Math.max(10, anchorRect.x - 140),
        top: anchorRect.y + anchorRect.height + 4,
        width: 260,
        zIndex: 100,
        backgroundColor: theme.dom.popoverBg,
        color: theme.dom.popoverText,
        border: `1px solid ${theme.dom.popoverBorder}`,
        borderRadius: 8,
        boxShadow: theme.dom.popoverShadow,
        backdropFilter: theme.dom.glassBackdrop,
        fontFamily: theme.fontFamily,
        fontSize: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.dom.popoverBorder}` }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={locale.searchValuesPlaceholder}
          style={{
            width: '100%',
            padding: '5px 8px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 4,
            outline: 'none',
            fontSize: 12,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.dom.popoverBorder}` }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={items.length > 0 && selectedSet.size === items.length}
            onChange={toggleAll}
          />
          <span>{locale.selectAll}</span>
        </label>
      </div>

      <div style={{ maxHeight: 180, overflowY: 'auto', padding: '6px 12px' }}>
        {loading ? (
          <div style={{ padding: '8px 0', color: '#8E8E93' }}>{locale.loading}</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '8px 0', color: '#8E8E93' }}>{locale.noMatches}</div>
        ) : (
          items.map((it) => (
            <label
              key={String(it.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 0',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <input
                  type="checkbox"
                  checked={selectedSet.has(it.value)}
                  onChange={() => toggleItem(it.value)}
                />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {it.label}
                </span>
              </div>
              {it.count !== undefined && (
                <span style={{ color: '#8E8E93', fontSize: 11 }}>({it.count})</span>
              )}
            </label>
          ))
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '8px 12px',
          borderTop: `1px solid ${theme.dom.popoverBorder}`,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <button
          onClick={handleClear}
          style={{
            padding: '5px 10px',
            backgroundColor: 'transparent',
            color: theme.dom.popoverText,
            border: `1px solid ${theme.dom.popoverBorder}`,
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          {locale.clear}
        </button>
        <button
          onClick={handleApply}
          style={{
            padding: '5px 12px',
            backgroundColor: theme.dom.accentColor,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 11,
          }}
        >
          {locale.apply}
        </button>
      </div>
    </div>
  );
};
