import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ColumnDef } from '../types/grid';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';
import { IDataStore } from '../types/store';
import { ColumnFilterState, DistinctItem, FilterOperation } from '../types/filter';
import { BLANK_FILTER_TOKEN } from '../core/FilterEngine';

export interface HeaderFilterPopoverProps {
  column: ColumnDef;
  anchorRect: { x: number; y: number; width: number; height: number };
  viewportWidth?: number;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  store: IDataStore;
  activeFilter?: ColumnFilterState;
  onApply: (filterState: ColumnFilterState | null) => void;
  onSort?: (desc: boolean) => void;
  onToggleGroup?: () => void;
  isGrouped?: boolean;
  onClose: () => void;
}

export const HeaderFilterPopover: React.FC<HeaderFilterPopoverProps> = ({
  column,
  anchorRect,
  viewportWidth = 1000,
  theme,
  locale,
  store,
  activeFilter,
  onApply,
  onSort,
  onToggleGroup,
  isGrouped,
  onClose,
}) => {
  const isTR = locale.code.startsWith('tr');
  const [tab, setTab] = useState<'values' | 'condition'>(activeFilter?.mode || 'values');
  const [allItems, setAllItems] = useState<DistinctItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedSet, setSelectedSet] = useState<Set<any>>(() => new Set(activeFilter?.selectedValues || []));

  // Condition filter states
  const defaultOp: FilterOperation =
    column.type === 'number' || column.type === 'currency' || column.type === 'rating' || column.type === 'progress'
      ? '>'
      : 'contains';
  const [operator, setOperator] = useState<FilterOperation>(activeFilter?.operator || defaultOp);
  const [condVal1, setCondVal1] = useState<string>(
    activeFilter?.value1 !== undefined ? String(activeFilter.value1) : ''
  );
  const [condVal2, setCondVal2] = useState<string>(
    activeFilter?.value2 !== undefined ? String(activeFilter.value2) : ''
  );

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch all distinct values once when opened for this column
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    store.getDistinctValues(column.id).then((res) => {
      if (!mounted) return;
      setAllItems(res);
      if (activeFilter && activeFilter.mode === 'values' && activeFilter.selectedValues) {
        setSelectedSet(new Set(activeFilter.selectedValues));
      } else {
        // No active value filter -> start with all items checked
        setSelectedSet(new Set(res.map((r) => r.value)));
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [column.id, store]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Outside click listener
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  }, [onClose]);

  const formatItemLabel = (it: DistinctItem): string => {
    if (it.value === BLANK_FILTER_TOKEN) return locale.emptyText;
    if (column.type === 'boolean') {
      return it.value ? locale.trueText : locale.falseText;
    }
    if ((column.type === 'select' || column.type === 'dropdown' || column.type === 'multiselect') && column.options) {
      const opt = column.options.find((o) => o.value === it.value);
      if (opt) return opt.label;
    }
    return it.label;
  };

  const visibleItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase().trim();
    return allItems.filter((it) => {
      const display = formatItemLabel(it).toLowerCase();
      return display.includes(q) || String(it.value).toLowerCase().includes(q);
    });
  }, [allItems, search, column, locale]);

  const areAllVisibleChecked =
    visibleItems.length > 0 && visibleItems.every((it) => selectedSet.has(it.value));

  const isIndeterminate =
    visibleItems.some((it) => selectedSet.has(it.value)) && !areAllVisibleChecked;

  const toggleAllVisible = () => {
    const next = new Set(selectedSet);
    if (areAllVisibleChecked) {
      for (const it of visibleItems) {
        next.delete(it.value);
      }
    } else {
      for (const it of visibleItems) {
        next.add(it.value);
      }
    }
    setSelectedSet(next);
  };

  const toggleSingleItem = (val: any) => {
    const next = new Set(selectedSet);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    setSelectedSet(next);
  };

  const handleApply = () => {
    if (tab === 'values') {
      if (allItems.length > 0 && selectedSet.size === allItems.length) {
        onApply(null);
      } else {
        onApply({
          columnId: column.id,
          mode: 'values',
          selectedValues: Array.from(selectedSet),
        });
      }
    } else {
      if (!condVal1.trim() && operator !== '=') {
        onApply(null);
      } else {
        onApply({
          columnId: column.id,
          mode: 'condition',
          operator,
          value1: condVal1,
          value2: condVal2,
        });
      }
    }
    onClose();
  };

  const handleClear = () => {
    onApply(null);
    onClose();
  };

  // Compute safe horizontal position inside viewport
  const popoverWidth = 285;
  const rawLeft = anchorRect.x + anchorRect.width - popoverWidth;
  const safeLeft = Math.max(8, Math.min(rawLeft, viewportWidth - popoverWidth - 16));

  return (
    <div
      ref={popoverRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter' && tab === 'condition') handleApply();
      }}
      style={{
        position: 'absolute',
        left: safeLeft,
        top: anchorRect.y + anchorRect.height + 4,
        width: popoverWidth,
        zIndex: 150,
        backgroundColor: theme.dom.popoverBg,
        color: theme.dom.popoverText,
        border: `1px solid ${theme.dom.popoverBorder}`,
        borderRadius: 10,
        boxShadow: theme.dom.popoverShadow,
        backdropFilter: theme.dom.glassBackdrop,
        fontFamily: theme.fontFamily,
        fontSize: 12,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Header Title & Quick Sort/Group Actions */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${theme.dom.popoverBorder}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 12 }}>{column.title}</span>
          <span
            style={{
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 4,
              backgroundColor: theme.dom.badgeBg,
              color: theme.dom.badgeText,
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            {column.type}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {column.sortable !== false && onSort && (
            <>
              <button
                type="button"
                onClick={() => {
                  onSort(false);
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: 11,
                  borderRadius: 5,
                  border: `1px solid ${theme.dom.popoverBorder}`,
                  backgroundColor: 'transparent',
                  color: theme.dom.popoverText,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                ▲ {isTR ? 'Artan Sırala' : 'Sort A → Z'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSort(true);
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: 11,
                  borderRadius: 5,
                  border: `1px solid ${theme.dom.popoverBorder}`,
                  backgroundColor: 'transparent',
                  color: theme.dom.popoverText,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                ▼ {isTR ? 'Azalan Sırala' : 'Sort Z → A'}
              </button>
            </>
          )}
          {column.groupable !== false &&
            column.type !== 'sparkline' &&
            column.type !== 'action' &&
            onToggleGroup && (
            <button
              type="button"
              onClick={() => {
                onToggleGroup();
                onClose();
              }}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 5,
                border: `1px solid ${theme.dom.popoverBorder}`,
                backgroundColor: isGrouped ? theme.dom.accentColor : 'transparent',
                color: isGrouped ? '#FFFFFF' : theme.dom.popoverText,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {isGrouped ? (isTR ? 'Grubu Kaldır' : 'Ungroup') : (isTR ? 'Grupla' : 'Group')}
            </button>
          )}
        </div>
      </div>

      {/* Mode Tabs: Values vs Condition */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.dom.popoverBorder}`,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <button
          type="button"
          onClick={() => setTab('values')}
          style={{
            flex: 1,
            padding: '7px 0',
            fontSize: 11,
            fontWeight: tab === 'values' ? 700 : 500,
            border: 'none',
            borderBottom: tab === 'values' ? `2px solid ${theme.dom.accentColor}` : '2px solid transparent',
            backgroundColor: 'transparent',
            color: tab === 'values' ? theme.dom.accentColor : theme.dom.popoverText,
            cursor: 'pointer',
          }}
        >
          {isTR ? `Değer Listesi (${selectedSet.size}/${allItems.length})` : `Value List (${selectedSet.size}/${allItems.length})`}
        </button>
        <button
          type="button"
          onClick={() => setTab('condition')}
          style={{
            flex: 1,
            padding: '7px 0',
            fontSize: 11,
            fontWeight: tab === 'condition' ? 700 : 500,
            border: 'none',
            borderBottom: tab === 'condition' ? `2px solid ${theme.dom.accentColor}` : '2px solid transparent',
            backgroundColor: 'transparent',
            color: tab === 'condition' ? theme.dom.accentColor : theme.dom.popoverText,
            cursor: 'pointer',
          }}
        >
          {isTR ? 'Koşul Filtresi' : 'Condition Rule'}
        </button>
      </div>

      {tab === 'values' ? (
        <>
          {/* Search Input */}
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.dom.popoverBorder}` }}>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale.searchValuesPlaceholder}
              style={{
                width: '100%',
                padding: '6px 8px',
                backgroundColor: theme.dom.inputBg,
                color: theme.dom.inputText,
                border: `1px solid ${theme.dom.inputBorder}`,
                borderRadius: 5,
                outline: 'none',
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Select All Bar */}
          <div
            onClick={toggleAllVisible}
            style={{
              padding: '7px 12px',
              borderBottom: `1px solid ${theme.dom.popoverBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontWeight: 600,
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={areAllVisibleChecked}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={() => {}}
                style={{ cursor: 'pointer', accentColor: theme.dom.accentColor, width: 14, height: 14 }}
              />
              <span>
                {search.trim()
                  ? isTR
                    ? '(Arama Sonuçlarını Seç)'
                    : '(Select Search Results)'
                  : locale.selectAll}
              </span>
            </div>
            <span style={{ fontSize: 10, color: '#8E8E93' }}>
              {selectedSet.size} / {allItems.length}
            </span>
          </div>

          {/* Distinct Values Checkbox List */}
          <div style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 6px' }}>
            {loading ? (
              <div style={{ padding: '12px 8px', color: '#8E8E93' }}>{locale.loading}</div>
            ) : visibleItems.length === 0 ? (
              <div style={{ padding: '12px 8px', color: '#8E8E93' }}>{locale.noMatches}</div>
            ) : (
              visibleItems.map((it) => {
                const isChecked = selectedSet.has(it.value);
                const optMatch =
                  column.type === 'select' || column.type === 'dropdown' || column.type === 'multiselect'
                    ? column.options?.find((o) => o.value === it.value)
                    : undefined;
                return (
                  <div
                    key={String(it.value)}
                    onClick={() => toggleSingleItem(it.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      borderRadius: 5,
                      cursor: 'pointer',
                      backgroundColor: isChecked
                        ? theme.isDark
                          ? 'rgba(10, 132, 255, 0.12)'
                          : 'rgba(0, 122, 255, 0.06)'
                        : 'transparent',
                      marginBottom: 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{
                          cursor: 'pointer',
                          accentColor: theme.dom.accentColor,
                          width: 14,
                          height: 14,
                          flexShrink: 0,
                        }}
                      />
                      {optMatch && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: theme.isDark
                              ? optMatch.darkFg || '#60A5FA'
                              : optMatch.fg || '#2563EB',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          fontWeight: isChecked ? 600 : 400,
                        }}
                      >
                        {formatItemLabel(it)}
                      </span>
                    </div>
                    {it.count !== undefined && (
                      <span style={{ color: '#8E8E93', fontSize: 11, marginLeft: 6, flexShrink: 0 }}>
                        {it.count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Condition Filter Tab */
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>
              {isTR ? 'Operatör' : 'Operator'}
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as FilterOperation)}
              style={{
                width: '100%',
                padding: '6px 8px',
                backgroundColor: theme.dom.inputBg,
                color: theme.dom.inputText,
                border: `1px solid ${theme.dom.inputBorder}`,
                borderRadius: 5,
                outline: 'none',
                fontSize: 12,
              }}
            >
              <option value="contains">{isTR ? 'İçerir (Contains)' : 'Contains'}</option>
              <option value="notcontains">{isTR ? 'İçermez (Does not contain)' : 'Does not contain'}</option>
              <option value="=">{isTR ? 'Eşittir (=)' : 'Equals (=)'}</option>
              <option value="<>">{isTR ? 'Eşit Değildir (≠)' : 'Does not equal (≠)'}</option>
              <option value="startswith">{isTR ? 'İle Başlar (Starts with)' : 'Starts with'}</option>
              <option value="endswith">{isTR ? 'İle Biter (Ends with)' : 'Ends with'}</option>
              <option value=">">{isTR ? 'Büyüktür (>)' : 'Greater than (>)'}</option>
              <option value=">=">{isTR ? 'Büyük veya Eşit (≥)' : 'Greater or equal (≥)'}</option>
              <option value="<">{isTR ? 'Küçüktür (<)' : 'Less than (<)'}</option>
              <option value="<=">{isTR ? 'Küçük veya Eşit (≤)' : 'Less or equal (≤)'}</option>
              <option value="between">{isTR ? 'Arasında (Between)' : 'Between'}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>
              {operator === 'between' ? (isTR ? 'Başlangıç Değeri' : 'Minimum Value') : isTR ? 'Değer' : 'Value'}
            </label>
            <input
              type="text"
              value={condVal1}
              onChange={(e) => setCondVal1(e.target.value)}
              placeholder={isTR ? 'Değer girin...' : 'Enter value...'}
              style={{
                width: '100%',
                padding: '6px 8px',
                backgroundColor: theme.dom.inputBg,
                color: theme.dom.inputText,
                border: `1px solid ${theme.dom.inputBorder}`,
                borderRadius: 5,
                outline: 'none',
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {operator === 'between' && (
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>
                {isTR ? 'Bitiş Değeri' : 'Maximum Value'}
              </label>
              <input
                type="text"
                value={condVal2}
                onChange={(e) => setCondVal2(e.target.value)}
                placeholder={isTR ? 'Maksimum değer...' : 'Enter max value...'}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: theme.dom.inputBg,
                  color: theme.dom.inputText,
                  border: `1px solid ${theme.dom.inputBorder}`,
                  borderRadius: 5,
                  outline: 'none',
                  fontSize: 12,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderTop: `1px solid ${theme.dom.popoverBorder}`,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: '5px 10px',
            backgroundColor: 'transparent',
            color: theme.dom.popoverText,
            border: `1px solid ${theme.dom.popoverBorder}`,
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {locale.clear}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '5px 10px',
              backgroundColor: 'transparent',
              color: '#8E8E93',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            {isTR ? 'İptal' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleApply}
            style={{
              padding: '5px 14px',
              backgroundColor: theme.dom.accentColor,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 11,
            }}
          >
            {locale.apply}
          </button>
        </div>
      </div>
    </div>
  );
};
