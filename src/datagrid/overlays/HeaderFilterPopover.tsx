import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ColumnDef } from '../types/grid';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';
import { IDataStore } from '../types/store';
import { ColumnFilterState, DistinctItem, FilterOperation } from '../types/filter';
import { BLANK_FILTER_TOKEN, FilterEngine } from '../core/FilterEngine';

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

const NUMERIC_COLUMN_TYPES = new Set([
  'number',
  'currency',
  'percent',
  'progress',
  'rating',
]);

/**
 * Formats a raw cell value identically to how the cell painter renders it on Canvas.
 */
export function formatCellStructureValue(
  rawVal: any,
  column: ColumnDef,
  locale: IGridLocale
): string {
  if (rawVal === BLANK_FILTER_TOKEN || rawVal === null || rawVal === undefined || rawVal === '') {
    return locale.emptyText;
  }

  const isTR = locale.code.startsWith('tr');

  if (column.type === 'currency') {
    const num = FilterEngine.parseNumeric(rawVal);
    if (isNaN(num)) return String(rawVal);
    const digits = column.decimalDigits ?? 2;
    const sym = column.currencySymbol || '$';
    const numStr = num.toLocaleString(locale.code, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return isTR ? `${numStr} ${sym}` : `${sym}${numStr}`;
  }

  if (column.type === 'number') {
    const num = FilterEngine.parseNumeric(rawVal);
    if (isNaN(num)) return String(rawVal);
    const isInt = column.decimalDigits === 0 || (column.decimalDigits === undefined && Number.isInteger(num));
    const digits = isInt ? 0 : column.decimalDigits ?? 2;
    return num.toLocaleString(locale.code, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  if (column.type === 'percent') {
    const num = FilterEngine.parseNumeric(rawVal);
    if (isNaN(num)) return String(rawVal);
    const digits = column.decimalDigits ?? 1;
    const numStr = num.toLocaleString(locale.code, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    const sign = (column.showVarianceSign ?? true) && num > 0 ? '+' : '';
    return `${sign}${numStr}%`;
  }

  if (column.type === 'progress') {
    const num = FilterEngine.parseNumeric(rawVal);
    if (isNaN(num)) return String(rawVal);
    return isTR ? `%${Math.round(num)}` : `${Math.round(num)}%`;
  }

  if (column.type === 'rating') {
    const num = Math.max(0, Math.min(5, Math.round(FilterEngine.parseNumeric(rawVal) || 0)));
    return `${'★'.repeat(num)}${'☆'.repeat(5 - num)} (${num})`;
  }

  if (column.type === 'boolean') {
    const b =
      typeof rawVal === 'boolean'
        ? rawVal
        : ['true', '1', 'evet', 'doğru', 'yes'].includes(String(rawVal).toLowerCase());
    return b ? locale.trueText : locale.falseText;
  }

  if (
    (column.type === 'select' ||
      column.type === 'dropdown' ||
      column.type === 'lookup' ||
      column.type === 'multiselect') &&
    column.options
  ) {
    const opt = column.options.find((o) => String(o.value) === String(rawVal));
    if (opt) return opt.subtitle ? `${opt.label} (${opt.subtitle})` : opt.label;
  }

  if (column.type === 'object' && typeof rawVal === 'object' && !Array.isArray(rawVal)) {
    return Object.entries(rawVal)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(' • ');
  }

  return String(rawVal);
}

/**
 * Formats a numeric input string live with locale thousands separators while preserving the user's decimal typing.
 */
function formatLiveNumericInput(rawInput: string, isTR: boolean): string {
  const thousandSep = isTR ? '.' : ',';
  const decSep = isTR ? ',' : '.';

  // Strip everything except digits, minus, and decimal separator
  let cleaned = rawInput.replace(new RegExp(`[^0-9\\-${decSep === ',' ? ',' : '\\.'}]`, 'g'), '');
  if (!cleaned) return '';

  const isNeg = cleaned.startsWith('-');
  cleaned = cleaned.replace(/-/g, '');

  const parts = cleaned.split(decSep);
  const intPartRaw = parts[0].replace(/^0+(?=\d)/, '');
  const intFormatted = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);

  if (parts.length > 1) {
    return `${isNeg ? '-' : ''}${intFormatted}${decSep}${parts[1].slice(0, 4)}`;
  }
  return `${isNeg ? '-' : ''}${intFormatted}`;
}

function initialConditionInputDisplay(rawVal: any, column: ColumnDef, isTR: boolean): string {
  if (rawVal === undefined || rawVal === null || rawVal === '') return '';
  if (NUMERIC_COLUMN_TYPES.has(column.type)) {
    const num = FilterEngine.parseNumeric(rawVal);
    if (!isNaN(num)) {
      const decSep = isTR ? ',' : '.';
      const str = String(num).replace('.', decSep);
      return formatLiveNumericInput(str, isTR);
    }
  }
  return String(rawVal);
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
  const isNumericCol = NUMERIC_COLUMN_TYPES.has(column.type);

  const [tab, setTab] = useState<'values' | 'condition'>(activeFilter?.mode || 'values');
  const [allItems, setAllItems] = useState<DistinctItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedSet, setSelectedSet] = useState<Set<any>>(
    () => new Set(activeFilter?.selectedValues || [])
  );
  const [listScrollTop, setListScrollTop] = useState<number>(0);

  // Condition filter states
  const defaultOp: FilterOperation = isNumericCol
    ? '<'
    : column.type === 'date' || column.type === 'datetime' || column.type === 'time' || column.type === 'boolean'
    ? '='
    : 'contains';

  const [operator, setOperator] = useState<FilterOperation>(activeFilter?.operator || defaultOp);
  const [condVal1, setCondVal1] = useState<string>(() =>
    initialConditionInputDisplay(activeFilter?.value1, column, isTR)
  );
  const [condVal2, setCondVal2] = useState<string>(() =>
    initialConditionInputDisplay(activeFilter?.value2, column, isTR)
  );

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const condInputRef = useRef<HTMLInputElement | null>(null);

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
        setSelectedSet(new Set(res.map((r) => r.value)));
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [column.id, store]);

  useEffect(() => {
    if (tab === 'values') {
      searchInputRef.current?.focus();
    } else {
      condInputRef.current?.focus();
    }
  }, [tab]);

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
    return formatCellStructureValue(it.value, column, locale);
  };

  const visibleItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase().trim();
    return allItems.filter((it) => {
      const display = formatItemLabel(it).toLowerCase();
      return display.includes(q) || String(it.value).toLowerCase().includes(q);
    });
  }, [allItems, search, column, locale]);

  // Live count of rows matching the current Condition Rule
  const conditionMatchCount = useMemo(() => {
    if (tab !== 'condition') return null;
    if (!condVal1.trim() && operator !== '=') return null;
    const v1 = isNumericCol ? FilterEngine.parseNumeric(condVal1) : condVal1;
    const v2 = isNumericCol ? FilterEngine.parseNumeric(condVal2) : condVal2;
    const target = operator === 'between' ? [v1, v2] : v1;

    let matched = 0;
    let total = 0;
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const itemCount = item.count ?? 1;
      total += itemCount;
      const rawVal = item.value === BLANK_FILTER_TOKEN ? '' : item.value;
      if (FilterEngine.match(rawVal, operator, target)) {
        matched += itemCount;
      }
    }
    return { matched, total };
  }, [tab, condVal1, condVal2, operator, allItems, isNumericCol]);

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
        const normalizedV1 = isNumericCol
          ? (() => {
              const n = FilterEngine.parseNumeric(condVal1);
              return isNaN(n) ? condVal1 : n;
            })()
          : condVal1;
        const normalizedV2 = isNumericCol
          ? (() => {
              const n = FilterEngine.parseNumeric(condVal2);
              return isNaN(n) ? condVal2 : n;
            })()
          : condVal2;

        onApply({
          columnId: column.id,
          mode: 'condition',
          operator,
          value1: normalizedV1,
          value2: normalizedV2,
        });
      }
    }
    onClose();
  };

  const handleClear = () => {
    setSearch('');
    setCondVal1('');
    setCondVal2('');
    setSelectedSet(new Set(allItems.map((r) => r.value)));
    onApply(null);
    onClose();
  };

  const renderStructuredConditionInput = (
    val: string,
    setVal: (v: string) => void,
    placeholder: string,
    autoFocusRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    // 1. Boolean Column -> True / False Select
    if (column.type === 'boolean') {
      return (
        <select
          value={val || 'true'}
          onChange={(e) => setVal(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 8px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 6,
            outline: 'none',
            fontSize: 12,
          }}
        >
          <option value="">{isTR ? 'Seçiniz...' : 'Select...'}</option>
          <option value="true">✓ {locale.trueText}</option>
          <option value="false">✕ {locale.falseText}</option>
        </select>
      );
    }

    // 2. Select / Dropdown / Lookup / MultiSelect with Options
    if (
      (column.type === 'select' ||
        column.type === 'dropdown' ||
        column.type === 'lookup' ||
        column.type === 'multiselect') &&
      column.options &&
      column.options.length > 0 &&
      (operator === '=' || operator === '<>' || operator === 'contains')
    ) {
      return (
        <select
          value={val}
          onChange={(e) => setVal(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 8px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 6,
            outline: 'none',
            fontSize: 12,
          }}
        >
          <option value="">{isTR ? 'Seçenek seçin...' : 'Choose option...'}</option>
          {column.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} {opt.subtitle ? `(${opt.subtitle})` : ''}
            </option>
          ))}
        </select>
      );
    }

    // 3. Date Column -> Native Date Picker
    if (column.type === 'date') {
      return (
        <input
          ref={autoFocusRef}
          type="date"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 6,
            outline: 'none',
            fontSize: 12,
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      );
    }

    // 4. Time Column -> Native Time Picker
    if (column.type === 'time') {
      return (
        <input
          ref={autoFocusRef}
          type="time"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 6,
            outline: 'none',
            fontSize: 12,
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      );
    }

    // 5. Currency / Number / Percent / Progress / Rating -> Live Formatted Cell-Structured Input
    if (isNumericCol) {
      const sym =
        column.type === 'currency'
          ? column.currencySymbol || '$'
          : column.type === 'percent' || column.type === 'progress'
          ? '%'
          : column.type === 'rating'
          ? '★'
          : '';
      const prefixSym =
        (column.type === 'currency' && !isTR) || (column.type === 'progress' && isTR) ? sym : '';
      const suffixSym =
        (column.type === 'currency' && isTR) ||
        (column.type === 'progress' && !isTR) ||
        column.type === 'percent' ||
        column.type === 'rating'
          ? sym
          : '';

      const parsedNum = FilterEngine.parseNumeric(val);
      const cellPreview =
        val.trim() !== '' && !isNaN(parsedNum)
          ? formatCellStructureValue(parsedNum, column, locale)
          : null;

      return (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: theme.dom.inputBg,
              border: `1px solid ${theme.dom.inputBorder}`,
              borderRadius: 6,
              padding: '0 8px',
            }}
          >
            {prefixSym && (
              <span
                style={{
                  color: theme.dom.accentColor,
                  fontWeight: 700,
                  fontSize: 12,
                  marginRight: 6,
                  fontFamily: 'monospace',
                }}
              >
                {prefixSym}
              </span>
            )}
            <input
              ref={autoFocusRef}
              type="text"
              inputMode="decimal"
              value={val}
              onChange={(e) => {
                setVal(formatLiveNumericInput(e.target.value, isTR));
              }}
              placeholder={
                column.type === 'currency'
                  ? isTR
                    ? '15.000,47'
                    : '15,000.47'
                  : column.type === 'progress' || column.type === 'percent'
                  ? '20'
                  : placeholder
              }
              style={{
                flex: 1,
                padding: '6px 0',
                backgroundColor: 'transparent',
                color: theme.dom.inputText,
                border: 'none',
                outline: 'none',
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: theme.fontFamily,
                textAlign: column.type === 'currency' || column.type === 'number' || column.type === 'percent' ? 'right' : 'left',
              }}
            />
            {suffixSym && (
              <span
                style={{
                  color: theme.dom.accentColor,
                  fontWeight: 700,
                  fontSize: 12,
                  marginLeft: 6,
                  fontFamily: 'monospace',
                }}
              >
                {suffixSym}
              </span>
            )}
          </div>
          {cellPreview && (
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                color: theme.dom.accentColor,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 600,
              }}
            >
              <span>{isTR ? 'Hücre biçimi:' : 'Cell format:'}</span>
              <span style={{ fontFamily: 'monospace' }}>{cellPreview}</span>
            </div>
          )}
        </div>
      );
    }

    // 6. Default Text / Email / URL / Phone / Object Input
    return (
      <input
        ref={autoFocusRef}
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '6px 8px',
          backgroundColor: theme.dom.inputBg,
          color: theme.dom.inputText,
          border: `1px solid ${theme.dom.inputBorder}`,
          borderRadius: 6,
          outline: 'none',
          fontSize: 12,
          boxSizing: 'border-box',
        }}
      />
    );
  };

  // Compute safe horizontal position inside viewport
  const popoverWidth = 295;
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
        if (e.key === 'Enter') handleApply();
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
                {isGrouped ? (isTR ? 'Grubu Kaldır' : 'Ungroup') : isTR ? 'Grupla' : 'Group'}
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
            borderBottom:
              tab === 'values' ? `2px solid ${theme.dom.accentColor}` : '2px solid transparent',
            backgroundColor: 'transparent',
            color: tab === 'values' ? theme.dom.accentColor : theme.dom.popoverText,
            cursor: 'pointer',
          }}
        >
          {isTR
            ? `Değer Listesi (${selectedSet.size}/${allItems.length})`
            : `Value List (${selectedSet.size}/${allItems.length})`}
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
            borderBottom:
              tab === 'condition' ? `2px solid ${theme.dom.accentColor}` : '2px solid transparent',
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
              onChange={(e) => {
                const nextQuery = e.target.value;
                setSearch(nextQuery);
                setListScrollTop(0);
                const q = nextQuery.toLowerCase().trim();
                if (q) {
                  const matched = allItems.filter((it) => {
                    const display = formatItemLabel(it).toLowerCase();
                    return display.includes(q) || String(it.value).toLowerCase().includes(q);
                  });
                  setSelectedSet(new Set(matched.map((m) => m.value)));
                } else if (
                  activeFilter &&
                  activeFilter.mode === 'values' &&
                  activeFilter.selectedValues
                ) {
                  setSelectedSet(new Set(activeFilter.selectedValues));
                } else {
                  setSelectedSet(new Set(allItems.map((r) => r.value)));
                }
              }}
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
                style={{
                  cursor: 'pointer',
                  accentColor: theme.dom.accentColor,
                  width: 14,
                  height: 14,
                }}
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

          {/* Virtualized Distinct Values Checkbox List */}
          <div
            onScroll={(e) => setListScrollTop(e.currentTarget.scrollTop)}
            style={{ height: 196, overflowY: 'auto', padding: '4px 6px', position: 'relative' }}
          >
            {loading ? (
              <div style={{ padding: '12px 8px', color: '#8E8E93' }}>{locale.loading}</div>
            ) : visibleItems.length === 0 ? (
              <div style={{ padding: '12px 8px', color: '#8E8E93' }}>{locale.noMatches}</div>
            ) : (
              (() => {
                const ITEM_H = 28;
                const totalH = visibleItems.length * ITEM_H;
                const startIdx = Math.max(0, Math.floor(listScrollTop / ITEM_H) - 3);
                const endIdx = Math.min(
                  visibleItems.length - 1,
                  Math.ceil((listScrollTop + 196) / ITEM_H) + 3
                );
                const slice = visibleItems.slice(startIdx, endIdx + 1);

                return (
                  <div style={{ height: totalH, position: 'relative' }}>
                    {slice.map((it, idx) => {
                      const realIdx = startIdx + idx;
                      const isChecked = selectedSet.has(it.value);
                      const optMatch =
                        column.type === 'select' ||
                        column.type === 'dropdown' ||
                        column.type === 'lookup' ||
                        column.type === 'multiselect'
                          ? column.options?.find((o) => o.value === it.value)
                          : undefined;
                      return (
                        <div
                          key={String(it.value)}
                          onClick={() => toggleSingleItem(it.value)}
                          style={{
                            position: 'absolute',
                            top: realIdx * ITEM_H,
                            left: 0,
                            right: 0,
                            height: ITEM_H - 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 8px',
                            borderRadius: 5,
                            cursor: 'pointer',
                            backgroundColor: isChecked
                              ? theme.isDark
                                ? 'rgba(10, 132, 255, 0.12)'
                                : 'rgba(0, 122, 255, 0.06)'
                              : 'transparent',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              overflow: 'hidden',
                            }}
                          >
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
                            {column.type === 'color' && typeof it.value === 'string' && (
                              <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 3,
                                  backgroundColor: it.value,
                                  border: '1px solid rgba(255,255,255,0.25)',
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
                            <span
                              style={{
                                color: '#8E8E93',
                                fontSize: 11,
                                marginLeft: 6,
                                flexShrink: 0,
                              }}
                            >
                              {it.count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()
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
                borderRadius: 6,
                outline: 'none',
                fontSize: 12,
              }}
            >
              {isNumericCol ? (
                <>
                  <option value="<">{isTR ? 'Küçüktür (<)' : 'Less than (<)'}</option>
                  <option value="<=">{isTR ? 'Küçük veya Eşit (≤)' : 'Less or equal (≤)'}</option>
                  <option value=">">{isTR ? 'Büyüktür (>)' : 'Greater than (>)'}</option>
                  <option value=">=">{isTR ? 'Büyük veya Eşit (≥)' : 'Greater or equal (≥)'}</option>
                  <option value="=">{isTR ? 'Eşittir (=)' : 'Equals (=)'}</option>
                  <option value="<>">{isTR ? 'Eşit Değildir (≠)' : 'Does not equal (≠)'}</option>
                  <option value="between">{isTR ? 'Arasında (Between)' : 'Between'}</option>
                  <option value="contains">{isTR ? 'İçerir (Contains)' : 'Contains'}</option>
                </>
              ) : (
                <>
                  <option value="contains">{isTR ? 'İçerir (Contains)' : 'Contains'}</option>
                  <option value="notcontains">
                    {isTR ? 'İçermez (Does not contain)' : 'Does not contain'}
                  </option>
                  <option value="=">{isTR ? 'Eşittir (=)' : 'Equals (=)'}</option>
                  <option value="<>">{isTR ? 'Eşit Değildir (≠)' : 'Does not equal (≠)'}</option>
                  <option value="startswith">{isTR ? 'İle Başlar (Starts with)' : 'Starts with'}</option>
                  <option value="endswith">{isTR ? 'İle Biter (Ends with)' : 'Ends with'}</option>
                  <option value=">">{isTR ? 'Büyüktür (>)' : 'Greater than (>)'}</option>
                  <option value=">=">{isTR ? 'Büyük veya Eşit (≥)' : 'Greater or equal (≥)'}</option>
                  <option value="<">{isTR ? 'Küçüktür (<)' : 'Less than (<)'}</option>
                  <option value="<=">{isTR ? 'Küçük veya Eşit (≤)' : 'Less or equal (≤)'}</option>
                  <option value="between">{isTR ? 'Arasında (Between)' : 'Between'}</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>
              {operator === 'between'
                ? isTR
                  ? 'Başlangıç Değeri'
                  : 'Minimum Value'
                : isTR
                ? 'Değer'
                : 'Value'}
            </label>
            {renderStructuredConditionInput(
              condVal1,
              setCondVal1,
              isTR ? 'Değer girin...' : 'Enter value...',
              condInputRef
            )}
          </div>

          {operator === 'between' && (
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>
                {isTR ? 'Bitiş Değeri' : 'Maximum Value'}
              </label>
              {renderStructuredConditionInput(
                condVal2,
                setCondVal2,
                isTR ? 'Maksimum değer...' : 'Enter max value...'
              )}
            </div>
          )}

          {/* Live Matching Rows Feedback */}
          {conditionMatchCount && (
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor:
                  conditionMatchCount.matched > 0
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(245, 158, 11, 0.14)',
                color: conditionMatchCount.matched > 0 ? '#10B981' : '#F59E0B',
                fontSize: 11.5,
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{isTR ? 'Eşleşen Kayıt:' : 'Matching Rows:'}</span>
              <span>
                {conditionMatchCount.matched.toLocaleString(locale.code)} /{' '}
                {conditionMatchCount.total.toLocaleString(locale.code)}
              </span>
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
            fontWeight: 600,
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
