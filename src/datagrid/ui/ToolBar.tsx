import React, { useState } from 'react';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { ThemeInput } from '../theme/ThemeEngine';
import { IGridLocale } from '../i18n/IGridLocale';
import { ColumnDef, GridPermissions } from '../types/grid';
import { SummaryType } from '../types/group';
import { SheetGLLogo } from './SheetGLLogo';

export interface ToolBarProps {
  rowCount: number;
  columnCount: number;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  currentThemeName: string;
  onThemeChange: (theme: ThemeInput) => void;
  onLocaleChange?: (localeCode: string) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onExportCsv: () => void;
  groups: string[];
  onToggleGroupColumn: (colId: string) => void;
  onExpandAllGroups?: () => void;
  onCollapseAllGroups?: () => void;
  availableColumns: ColumnDef[];
  onUpdateColumn?: (colId: string, patch: Partial<ColumnDef>) => void;
  summaryTypes?: Record<string, SummaryType>;
  onChangeSummaryType?: (colId: string, summaryType: SummaryType) => void;

  // CRUD, Undo/Redo & Batch Save
  permissions?: GridPermissions;
  onPermissionsChange?: (next: GridPermissions) => void;
  onAddRow?: () => void;
  onDuplicateRow?: () => void;
  onDeleteRow?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  pendingChangesCount?: number;
  onSaveBatch?: () => void;
  onDiscardBatch?: () => void;
  activeFilterCount?: number;
  onClearAllFilters?: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  rowCount,
  columnCount,
  theme,
  locale,
  currentThemeName,
  onThemeChange,
  onLocaleChange,
  searchKeyword,
  onSearchChange,
  onExportCsv,
  groups,
  onToggleGroupColumn,
  onExpandAllGroups,
  onCollapseAllGroups,
  availableColumns,
  onUpdateColumn,
  summaryTypes = {},
  onChangeSummaryType,
  permissions,
  onPermissionsChange,
  onAddRow,
  onDuplicateRow,
  onDeleteRow,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  pendingChangesCount = 0,
  onSaveBatch,
  onDiscardBatch,
  activeFilterCount = 0,
  onClearAllFilters,
}) => {
  const [showColSettings, setShowColSettings] = useState(false);
  const isTR = locale.code.startsWith('tr');

  const isReadonlyMode =
    permissions?.mode === 'read' ||
    permissions?.mode === 'readonly' ||
    permissions?.allowUpdating === false;

  const canAdd = !isReadonlyMode && permissions?.allowAdding !== false;
  const canDup = !isReadonlyMode && permissions?.allowDuplicating !== false;
  const canDel = !isReadonlyMode && permissions?.allowDeleting !== false;

  const btnStyle = (disabled: boolean = false, accent: boolean = false, danger: boolean = false): React.CSSProperties => ({
    padding: '4px 9px',
    backgroundColor: accent
      ? theme.dom.accentColor
      : danger
      ? 'rgba(255, 69, 58, 0.14)'
      : theme.dom.inputBg,
    color: accent
      ? '#FFFFFF'
      : danger
      ? '#FF453A'
      : theme.dom.toolbarText,
    border: accent ? 'none' : `1px solid ${danger ? 'rgba(255,69,58,0.35)' : theme.dom.inputBorder}`,
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: theme.fontFamily,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.dom.toolbarBg,
        borderBottom: `1px solid ${theme.dom.toolbarBorder}`,
        color: theme.dom.toolbarText,
        backdropFilter: theme.dom.glassBackdrop,
        fontFamily: theme.fontFamily,
        fontSize: 12,
        userSelect: 'none',
        position: 'relative',
        zIndex: 140,
      }}
    >
      {/* PRIMARY TOOLBAR ROW */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 14px',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Brand + Row Stats + CRUD + Undo/Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 13, userSelect: 'none' }}>
            <SheetGLLogo size={18} glow={!isReadonlyMode} />
            <span style={{ letterSpacing: '-0.01em' }}>SheetGL</span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isReadonlyMode ? '#FF9F0A' : '#30D158',
                boxShadow: isReadonlyMode ? '0 0 6px #FF9F0A' : '0 0 6px #30D158',
                marginLeft: -1,
              }}
              title={isReadonlyMode ? 'ReadOnly' : 'Live / Write'}
            />
          </div>

          <span
            style={{
              padding: '2px 8px',
              backgroundColor: theme.dom.badgeBg,
              color: theme.dom.badgeText,
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {rowCount.toLocaleString(locale.code)} {locale.rows} × {columnCount} {locale.columns}
          </span>

          <div style={{ width: 1, height: 18, backgroundColor: theme.dom.toolbarBorder }} />

          {/* CRUD Action Buttons */}
          {onAddRow && (
            <button
              type="button"
              disabled={!canAdd}
              onClick={onAddRow}
              title={isTR ? 'Yeni Satır Ekle' : 'Add New Row'}
              style={btnStyle(!canAdd)}
            >
              <span>＋</span>
              <span>{isTR ? 'Satır Ekle' : 'Add Row'}</span>
            </button>
          )}

          {onDuplicateRow && (
            <button
              type="button"
              disabled={!canDup || !canAdd}
              onClick={onDuplicateRow}
              title={isTR ? 'Seçili Satırı Çoğalt' : 'Duplicate Active Row'}
              style={btnStyle(!canDup || !canAdd)}
            >
              <span>⧉</span>
              <span>{isTR ? 'Satır Çoğalt' : 'Duplicate Row'}</span>
            </button>
          )}

          {onDeleteRow && (
            <button
              type="button"
              disabled={!canDel}
              onClick={onDeleteRow}
              title={isTR ? 'Seçili Satırı Sil' : 'Delete Active Row'}
              style={btnStyle(!canDel, false, true)}
            >
              <span>🗑</span>
              <span>{isTR ? 'Sil' : 'Delete'}</span>
            </button>
          )}

          <div style={{ width: 1, height: 18, backgroundColor: theme.dom.toolbarBorder }} />

          {/* Undo / Redo */}
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            style={btnStyle(!canUndo)}
          >
            ↶
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
            style={btnStyle(!canRedo)}
          >
            ↷
          </button>
        </div>

        {/* Center: Search & Grouping & Filter Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, maxWidth: 440, minWidth: 220 }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={locale.searchPlaceholder}
              style={{
                width: '100%',
                padding: '5px 24px 5px 10px',
                backgroundColor: theme.dom.inputBg,
                color: theme.dom.inputText,
                border: `1px solid ${theme.dom.inputBorder}`,
                borderRadius: 6,
                outline: 'none',
                fontSize: 12,
                fontFamily: theme.fontFamily,
              }}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: 6,
                  border: 'none',
                  background: 'transparent',
                  color: '#8E8E93',
                  cursor: 'pointer',
                  fontSize: 11,
                  padding: 2,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Grouping Quick Selector */}
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) onToggleGroupColumn(e.target.value);
            }}
            style={{
              padding: '5px 8px',
              backgroundColor: theme.dom.inputBg,
              color: theme.dom.inputText,
              border: `1px solid ${theme.dom.inputBorder}`,
              borderRadius: 6,
              outline: 'none',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="">{locale.addGroup}</option>
            {availableColumns
              .filter((c) => c.type !== 'sparkline' && c.type !== 'action')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {groups.includes(c.id) ? '✓' : ''}
                </option>
              ))}
          </select>

          {activeFilterCount > 0 && onClearAllFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                border: `1px solid ${theme.dom.accentColor}`,
                backgroundColor: theme.isDark ? 'rgba(10,132,255,0.16)' : 'rgba(0,122,255,0.1)',
                color: theme.dom.accentColor,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              ✕ {isTR ? `Filtreler (${activeFilterCount})` : `Filters (${activeFilterCount})`}
            </button>
          )}
        </div>

        {/* Right: Batch Save Bar + Permissions + Column Settings + Locale + Theme + Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Batch Save / Discard Controls */}
          {pendingChangesCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 6px',
                borderRadius: 7,
                backgroundColor: theme.isDark ? 'rgba(48, 209, 88, 0.14)' : 'rgba(52, 199, 89, 0.12)',
                border: '1px solid rgba(48, 209, 88, 0.4)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#30D158' }}>
                ● {pendingChangesCount} {isTR ? 'Değişiklik' : 'Unsaved'}
              </span>
              {onSaveBatch && (
                <button
                  type="button"
                  onClick={onSaveBatch}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 5,
                    border: 'none',
                    backgroundColor: '#30D158',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isTR ? 'Toplu Kaydet (Batch)' : 'Batch Save'}
                </button>
              )}
              {onDiscardBatch && (
                <button
                  type="button"
                  onClick={onDiscardBatch}
                  style={{
                    padding: '3px 7px',
                    borderRadius: 5,
                    border: `1px solid ${theme.dom.inputBorder}`,
                    backgroundColor: 'transparent',
                    color: theme.dom.toolbarText,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {isTR ? 'Geri Al' : 'Discard'}
                </button>
              )}
            </div>
          )}

          {/* Permission Mode Switcher */}
          {onPermissionsChange && (
            <select
              value={permissions?.mode || 'write'}
              onChange={(e) => {
                const mode = e.target.value as 'write' | 'read' | 'readonly';
                onPermissionsChange({
                  ...permissions,
                  mode,
                  allowUpdating: mode === 'write',
                  allowAdding: mode === 'write',
                  allowDeleting: mode === 'write',
                  allowDuplicating: mode === 'write',
                  allowClipboardPaste: mode === 'write',
                });
              }}
              title={isTR ? 'Tablo Yetki Modu (Permissions)' : 'Grid Permission Mode'}
              style={{
                padding: '4px 8px',
                backgroundColor: isReadonlyMode
                  ? 'rgba(255, 159, 10, 0.16)'
                  : theme.dom.inputBg,
                color: isReadonlyMode ? '#FF9F0A' : theme.dom.inputText,
                border: `1px solid ${isReadonlyMode ? 'rgba(255,159,10,0.4)' : theme.dom.inputBorder}`,
                borderRadius: 6,
                outline: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value="write">✎ {isTR ? 'Yetki: Yazma (Write)' : 'Perm: Write (Full)'}</option>
              <option value="readonly">🔒 {isTR ? 'Yetki: Salt Okunur (ReadOnly)' : 'Perm: Read-Only'}</option>
              <option value="read">👁 {isTR ? 'Yetki: Sadece Okuma (Read)' : 'Perm: Read View'}</option>
            </select>
          )}

          {/* Column Permissions & Summary Settings Popover Toggle */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowColSettings((v) => !v)}
              style={btnStyle(false, showColSettings)}
            >
              <span>⚙</span>
              <span>{isTR ? 'Sütun Ayarları' : 'Columns'}</span>
            </button>

            {showColSettings && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  width: 380,
                  maxHeight: 360,
                  overflowY: 'auto',
                  backgroundColor: theme.dom.popoverBg,
                  color: theme.dom.popoverText,
                  border: `1px solid ${theme.dom.popoverBorder}`,
                  borderRadius: 10,
                  boxShadow: theme.dom.popoverShadow,
                  backdropFilter: theme.dom.glassBackdrop,
                  padding: 12,
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${theme.dom.popoverBorder}`,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 12 }}>
                    {isTR ? 'Sütun Yetkileri, Sabitleme ve Özet Ayarları' : 'Column Permissions, Pinning & Summaries'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowColSettings(false)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#8E8E93',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {availableColumns.map((col) => {
                    const isRO = Boolean(col.readonly || col.permission === 'readonly');
                    const isPinned = Boolean(col.pinned);
                    const sumType = summaryTypes[col.id] || 'none';
                    return (
                      <div
                        key={col.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                          padding: '5px 8px',
                          borderRadius: 6,
                          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
                          fontSize: 11,
                        }}
                      >
                        <div style={{ flex: 1, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {col.title}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {/* Toggle ReadOnly vs Write */}
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateColumn?.(col.id, {
                                readonly: !isRO,
                                permission: !isRO ? 'readonly' : 'write',
                              })
                            }
                            style={{
                              padding: '2px 6px',
                              fontSize: 10,
                              borderRadius: 4,
                              border: `1px solid ${theme.dom.popoverBorder}`,
                              backgroundColor: isRO ? 'rgba(255,159,10,0.16)' : 'rgba(48,209,88,0.15)',
                              color: isRO ? '#FF9F0A' : '#30D158',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {isRO ? '🔒 ReadOnly' : '✎ Write'}
                          </button>

                          {/* Toggle Pin */}
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateColumn?.(col.id, {
                                pinned: isPinned ? false : 'left',
                              })
                            }
                            style={{
                              padding: '2px 6px',
                              fontSize: 10,
                              borderRadius: 4,
                              border: `1px solid ${theme.dom.popoverBorder}`,
                              backgroundColor: isPinned ? theme.dom.accentColor : 'transparent',
                              color: isPinned ? '#FFFFFF' : theme.dom.popoverText,
                              cursor: 'pointer',
                            }}
                          >
                            📌 {isPinned ? 'Pinned' : 'Pin'}
                          </button>

                          {/* Summary Selector */}
                          <select
                            value={sumType}
                            onChange={(e) =>
                              onChangeSummaryType?.(col.id, e.target.value as SummaryType)
                            }
                            style={{
                              padding: '2px 4px',
                              fontSize: 10,
                              borderRadius: 4,
                              border: `1px solid ${theme.dom.popoverBorder}`,
                              backgroundColor: theme.dom.inputBg,
                              color: theme.dom.inputText,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="none">No Sum</option>
                            <option value="sum">SUM</option>
                            <option value="avg">AVG</option>
                            <option value="min">MIN</option>
                            <option value="max">MAX</option>
                            <option value="count">COUNT</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {onLocaleChange && (
            <select
              value={locale.code}
              onChange={(e) => onLocaleChange(e.target.value)}
              style={{
                padding: '4px 7px',
                backgroundColor: theme.dom.inputBg,
                color: theme.dom.inputText,
                border: `1px solid ${theme.dom.inputBorder}`,
                borderRadius: 6,
                outline: 'none',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <option value="en-US">EN</option>
              <option value="tr-TR">TR</option>
            </select>
          )}

          <select
            value={currentThemeName}
            onChange={(e) => onThemeChange(e.target.value as ThemeInput)}
            style={{
              padding: '4px 7px',
              backgroundColor: theme.dom.inputBg,
              color: theme.dom.inputText,
              border: `1px solid ${theme.dom.inputBorder}`,
              borderRadius: 6,
              outline: 'none',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <option value="apple-light">Apple Light</option>
            <option value="apple-dark">Apple Dark</option>
            <option value="google-light">Google Light</option>
            <option value="google-dark">Google Dark</option>
            <option value="system">{locale.systemTheme}</option>
          </select>

          {permissions?.allowExport !== false && (
            <button
              type="button"
              onClick={onExportCsv}
              style={btnStyle(false, true)}
            >
              {locale.exportCsv}
            </button>
          )}
        </div>
      </div>

      {/* SECONDARY GROUPING BREADCRUMB BAR (Shown when grouping is active) */}
      {groups.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 14px',
            borderTop: `1px solid ${theme.dom.toolbarBorder}`,
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            fontSize: 11,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#8E8E93', fontWeight: 600 }}>
              {isTR ? 'Aktif Gruplar:' : 'Grouped By:'}
            </span>
            {groups.map((colId, idx) => {
              const col = availableColumns.find((c) => c.id === colId);
              return (
                <React.Fragment key={colId}>
                  {idx > 0 && <span style={{ color: '#8E8E93' }}>›</span>}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: theme.dom.badgeBg,
                      color: theme.dom.badgeText,
                      fontWeight: 600,
                    }}
                  >
                    <span>{col?.title || colId}</span>
                    <button
                      type="button"
                      onClick={() => onToggleGroupColumn(colId)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: theme.dom.badgeText,
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ✕
                    </button>
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {onExpandAllGroups && (
              <button
                type="button"
                onClick={onExpandAllGroups}
                style={{
                  padding: '2px 8px',
                  fontSize: 10,
                  borderRadius: 4,
                  border: `1px solid ${theme.dom.inputBorder}`,
                  backgroundColor: 'transparent',
                  color: theme.dom.toolbarText,
                  cursor: 'pointer',
                }}
              >
                {isTR ? 'Tümünü Aç' : 'Expand All'}
              </button>
            )}
            {onCollapseAllGroups && (
              <button
                type="button"
                onClick={onCollapseAllGroups}
                style={{
                  padding: '2px 8px',
                  fontSize: 10,
                  borderRadius: 4,
                  border: `1px solid ${theme.dom.inputBorder}`,
                  backgroundColor: 'transparent',
                  color: theme.dom.toolbarText,
                  cursor: 'pointer',
                }}
              >
                {isTR ? 'Tümünü Kapat' : 'Collapse All'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
