import React, { useState, useEffect } from 'react';
import {
  COLUMN_COLOR_PRESET_LIST,
  ColumnColorPreset,
  ColumnDef,
  GridEventLogEntry,
  RowSelectionMode,
  ToolbarButtonDisplayMode,
} from '../datagrid';
import {
  COLUMN_PRESETS,
  ColumnPresetId,
  DatasetFillMode,
  DEFAULT_STUDIO_WIZARD_STATE,
  StudioWizardState,
  StudioWizardTab,
} from './types';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { CustomColumnBuilder, CustomColumnDefinitionMeta } from './CustomColumnBuilder';

export interface StudioWizardDrawerProps {
  open: boolean;
  activeTab: StudioWizardTab;
  onTabChange: (tab: StudioWizardTab) => void;
  onClose: () => void;
  isDark: boolean;
  isTR: boolean;
  state: StudioWizardState;
  onChange: (updater: (prev: StudioWizardState) => StudioWizardState) => void;
  allColumns: ColumnDef[];
  customColumns: CustomColumnDefinitionMeta[];
  onAddCustomColumn: (meta: CustomColumnDefinitionMeta) => void;
  onRemoveCustomColumn: (colId: string) => void;
  selectedRowCount: number;
  eventLogs: GridEventLogEntry[];
  lastSavePayload?: any;
  onClearLogs: () => void;
}

const ROW_COUNT_PRESETS = [0, 10, 50, 250, 1000, 10000, 50000, 100000];

export const StudioWizardDrawer: React.FC<StudioWizardDrawerProps> = ({
  open,
  activeTab,
  onTabChange,
  onClose,
  isDark,
  isTR,
  state,
  onChange,
  allColumns,
  customColumns,
  onAddCustomColumn,
  onRemoveCustomColumn,
  selectedRowCount,
  eventLogs,
  lastSavePayload,
  onClearLogs,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 860 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 860);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!open) return null;

  const bg = isDark ? '#0F172A' : '#FFFFFF';
  const cardBg = isDark ? '#1E293B' : '#F8FAFC';
  const borderCol = isDark ? '#1E293B' : '#E2E8F0';
  const subtleBorder = isDark ? '#334155' : '#CBD5E1';
  const textCol = isDark ? '#F9FAFB' : '#0F172A';
  const mutedText = isDark ? '#94A3B8' : '#64748B';

  const setFillMode = (mode: DatasetFillMode) => {
    onChange((prev) => ({
      ...prev,
      datasetFillMode: mode,
      rowCount: mode === 'empty' ? 0 : prev.rowCount === 0 ? 1000 : prev.rowCount,
    }));
  };

  const setRowCount = (count: number) => {
    const clamped = Math.max(0, Math.min(200000, count));
    onChange((prev) => ({
      ...prev,
      rowCount: clamped,
      datasetFillMode: clamped === 0 ? 'empty' : prev.datasetFillMode === 'empty' ? 'populated' : prev.datasetFillMode,
    }));
  };

  const setColumnPreset = (preset: ColumnPresetId) => {
    onChange((prev) => ({
      ...prev,
      columnPreset: preset,
      enabledColumnIds: [...COLUMN_PRESETS[preset]],
    }));
  };

  const toggleColumnId = (colId: string) => {
    onChange((prev) => {
      const exists = prev.enabledColumnIds.includes(colId);
      if (exists && prev.enabledColumnIds.length <= 1) return prev;
      const next = exists
        ? prev.enabledColumnIds.filter((id) => id !== colId)
        : [...prev.enabledColumnIds, colId];
      return {
        ...prev,
        enabledColumnIds: next,
      };
    });
  };

  const stepColumnVariety = (delta: number) => {
    onChange((prev) => {
      const allIds = allColumns.map((c) => c.id);
      const currentCount = prev.enabledColumnIds.length;
      const targetCount = Math.max(1, Math.min(allIds.length, currentCount + delta));
      return {
        ...prev,
        enabledColumnIds: allIds.slice(0, targetCount),
      };
    });
  };

  const toggleToolbarKey = (key: keyof StudioWizardState['toolbarConfig']) => {
    onChange((prev) => ({
      ...prev,
      toolbarConfig: {
        ...prev.toolbarConfig,
        [key]: !prev.toolbarConfig[key],
      },
    }));
  };

  const applyToolbarProfile = (profile: 'full' | 'minimal' | 'readonly') => {
    onChange((prev) => {
      if (profile === 'full') {
        return {
          ...prev,
          toolbarConfig: { ...DEFAULT_STUDIO_WIZARD_STATE.toolbarConfig },
          showFormulaBar: true,
          showSummaryRow: true,
        };
      }
      if (profile === 'minimal') {
        return {
          ...prev,
          toolbarConfig: {
            ...prev.toolbarConfig,
            visible: true,
            buttonDisplayMode: 'icon',
            showBrand: true,
            showAddRow: true,
            showDuplicateRow: false,
            showDeleteRow: true,
            showUndoRedo: true,
            showSearch: true,
            showGroupBy: false,
            showClearFilters: true,
            showBatchActions: true,
            showSelectionModeSwitch: false,
            showPermissionsSwitch: false,
            showColumnSettings: true,
            showLocaleSwitch: false,
            showThemeSwitch: false,
            showExportCsv: false,
          },
          showFormulaBar: false,
          showSummaryRow: true,
        };
      }
      return {
        ...prev,
        toolbarConfig: {
          ...prev.toolbarConfig,
          visible: true,
          buttonDisplayMode: 'icon-text',
          showBrand: true,
          showAddRow: false,
          showDuplicateRow: false,
          showDeleteRow: false,
          showUndoRedo: false,
          showSearch: true,
          showGroupBy: true,
          showClearFilters: true,
          showBatchActions: false,
          showSelectionModeSwitch: false,
          showPermissionsSwitch: false,
          showColumnSettings: true,
          showLocaleSwitch: true,
          showThemeSwitch: true,
          showExportCsv: true,
        },
        showFormulaBar: false,
        showSummaryRow: true,
      };
    });
  };

  return (
    <>
      {isMobile && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 550,
          }}
        />
      )}
      <aside
        style={{
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? 0 : undefined,
          right: isMobile ? 0 : undefined,
          bottom: isMobile ? 0 : undefined,
          width: isMobile ? 'min(390px, 92vw)' : 390,
          height: '100%',
          backgroundColor: bg,
          color: textCol,
          borderLeft: `1px solid ${borderCol}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: isMobile ? 560 : 200,
          boxShadow: isDark ? '-12px 0 36px rgba(0,0,0,0.55)' : '-8px 0 24px rgba(15,23,42,0.12)',
        }}
      >
      {/* Drawer Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: `1px solid ${borderCol}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🪄</span>
            <span>{isTR ? 'Stüdyo Sihirbazı & Diagnostik Çekmecesi' : 'Studio Wizard & Diagnostics'}</span>
          </div>
          <div style={{ fontSize: 11, color: mutedText, marginTop: 2 }}>
            {isTR
              ? 'Veri boyutu, sütun çeşitliliği, seçim modu ve toolbar kontrolü'
              : 'Configure dataset, column variety, selection & toolbar'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => onChange(() => ({ ...DEFAULT_STUDIO_WIZARD_STATE }))}
            title={isTR ? 'Varsayılan ayarlara sıfırla' : 'Reset to defaults'}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: `1px solid ${subtleBorder}`,
              backgroundColor: 'transparent',
              color: mutedText,
              fontSize: 10.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isTR ? 'Sıfırla' : 'Reset'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: `1px solid ${subtleBorder}`,
              backgroundColor: 'transparent',
              color: textCol,
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 4-Tab Navigation Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
          padding: '8px 10px',
          borderBottom: `1px solid ${borderCol}`,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC',
        }}
      >
        {[
          { id: 'data' as StudioWizardTab, label: isTR ? '📊 Veri & Seçim' : '📊 Data & Select' },
          {
            id: 'columns' as StudioWizardTab,
            label: isTR ? `🧱 Sütun (${state.enabledColumnIds.length})` : `🧱 Cols (${state.enabledColumnIds.length})`,
          },
          { id: 'toolbar' as StudioWizardTab, label: isTR ? '🧰 Toolbar' : '🧰 Toolbar' },
          {
            id: 'diagnostics' as StudioWizardTab,
            label: isTR ? `⚡ Diagnostik` : `⚡ Diagnostics`,
          },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '6px 4px',
                borderRadius: 7,
                border: `1px solid ${active ? '#8B5CF6' : 'transparent'}`,
                backgroundColor: active
                  ? isDark
                    ? 'rgba(139, 92, 246, 0.2)'
                    : 'rgba(139, 92, 246, 0.1)'
                : 'transparent',
                color: active ? (isDark ? '#DDD6FE' : '#6D28D9') : mutedText,
                fontSize: 11,
                fontWeight: active ? 800 : 650,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* TAB 1: DATA & SELECTION WIZARD */}
        {activeTab === 'data' && (
          <>
            {/* Dataset Fill State (Populated / Sparse / Empty 0 Rows) */}
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: cardBg,
                border: `1px solid ${subtleBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 12 }}>
                1. {isTR ? 'Veri Doluluk Durumu (Boş / Dolu Tablo Testi)' : 'Dataset Fill State (Empty / Populated)'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  {
                    id: 'populated' as DatasetFillMode,
                    title: isTR ? '🟢 Tam Dolu Veri Seti (Populated)' : '🟢 Fully Populated Dataset',
                    desc: isTR
                      ? 'Tüm hücreler zengin kurumsal ve finansal verilerle doldurulur.'
                      : 'All cells are populated with realistic enterprise & financial records.',
                  },
                  {
                    id: 'sparse' as DatasetFillMode,
                    title: isTR ? '🟡 Kısmen Boş / Seyrek Veri (Sparse Nulls)' : '🟡 Partially Empty / Sparse Dataset',
                    desc: isTR
                      ? 'Hücrelerin ~%35’i boş (null) bırakılır; boş filtre ve validasyon testi için.'
                      : '~35% of cells are left empty/null to test blank filtering & validation.',
                  },
                  {
                    id: 'empty' as DatasetFillMode,
                    title: isTR ? '⚪ Tamamen Boş Tablo (Empty DataGrid - 0 Satır)' : '⚪ Completely Empty Table (0 Rows)',
                    desc: isTR
                      ? '0 satırlı boş bir DataGrid tablosu oluşturur; sıfırdan satır eklemeyi test edin.'
                      : 'Renders an empty DataGrid with 0 rows to test empty state & row insertion.',
                  },
                ].map((opt) => {
                  const active = state.datasetFillMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFillMode(opt.id)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: `1px solid ${active ? '#8B5CF6' : subtleBorder}`,
                        backgroundColor: active
                          ? isDark
                            ? 'rgba(139, 92, 246, 0.16)'
                            : 'rgba(139, 92, 246, 0.08)'
                          : 'transparent',
                        color: textCol,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 750, fontSize: 11.5 }}>{opt.title}</div>
                      <div style={{ fontSize: 10.5, color: mutedText, marginTop: 2 }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row Count Stepper & Presets */}
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: cardBg,
                border: `1px solid ${subtleBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 12 }}>
                  2. {isTR ? 'Veri / Satır Sayısı' : 'Row Count'}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.12)',
                    color: '#38BDF8',
                    fontWeight: 800,
                    fontSize: 11.5,
                  }}
                >
                  {state.rowCount.toLocaleString()} {isTR ? 'Satır' : 'Rows'}
                </span>
              </div>

              {/* Increment / Decrement Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setRowCount(state.rowCount - (state.rowCount > 1000 ? 1000 : 50))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 7,
                    border: `1px solid ${subtleBorder}`,
                    backgroundColor: 'transparent',
                    color: textCol,
                    fontWeight: 750,
                    fontSize: 11.5,
                    cursor: 'pointer',
                  }}
                >
                  − {isTR ? 'Azalt' : 'Decrease'}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={50}
                  value={state.rowCount}
                  onChange={(e) => setRowCount(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
                <button
                  type="button"
                  onClick={() => setRowCount(state.rowCount + (state.rowCount >= 1000 ? 1000 : 100))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 7,
                    border: `1px solid ${subtleBorder}`,
                    backgroundColor: 'transparent',
                    color: textCol,
                    fontWeight: 750,
                    fontSize: 11.5,
                    cursor: 'pointer',
                  }}
                >
                  + {isTR ? 'Artır' : 'Increase'}
                </button>
              </div>

              {/* Preset Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                {ROW_COUNT_PRESETS.map((cnt) => {
                  const active = state.rowCount === cnt;
                  return (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setRowCount(cnt)}
                      style={{
                        padding: '5px 4px',
                        borderRadius: 6,
                        border: `1px solid ${active ? '#38BDF8' : subtleBorder}`,
                        backgroundColor: active
                          ? isDark
                            ? 'rgba(56, 189, 248, 0.2)'
                            : 'rgba(2, 132, 199, 0.12)'
                          : 'transparent',
                        color: active ? '#38BDF8' : textCol,
                        fontWeight: active ? 800 : 600,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {cnt === 0 ? (isTR ? '0 (Boş)' : '0 (Empty)') : cnt.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row Selection Mode (None / Single Choice / Multiple Choice) */}
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: cardBg,
                border: `1px solid ${subtleBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 12 }}>
                3. {isTR ? 'Satır Seçim Modu (Tekli & Çoklu Seçim)' : 'Row Selection Mode (Single & Multiple Choice)'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  {
                    mode: 'multiple' as RowSelectionMode,
                    title: isTR ? '☑️ Çoklu Seçim (Multiple Choice - Checkbox)' : '☑️ Multiple Choice (Checkbox)',
                    desc: isTR
                      ? 'Sol sütuna onay kutuları ve Tümünü Seç başlığı ekler. Çoklu satır silmeyi destekler.'
                      : 'Adds row checkboxes & Select-All header. Enables multi-row batch deletion.',
                  },
                  {
                    mode: 'single' as RowSelectionMode,
                    title: isTR ? '🔘 Tekli Seçim (Single Choice - Radio)' : '🔘 Single Choice (Radio Button)',
                    desc: isTR
                      ? 'Sol sütuna radyo butonu ekler; aynı anda yalnızca 1 satır seçilebilir.'
                      : 'Adds radio buttons; only a single row can be selected at a time.',
                  },
                  {
                    mode: 'none' as RowSelectionMode,
                    title: isTR ? '⬜ Satır Seçim Sütunu Yok (Standart Hücre Aralığı)' : '⬜ No Row Selection Column',
                    desc: isTR
                      ? 'Sol seçim sütununu gizler, yalnızca Excel tipi hücre aralığı seçimi çalışır.'
                      : 'Hides the selection column; uses standard spreadsheet cell range selection.',
                  },
                ].map((item) => {
                  const active = state.selectionMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          selectionMode: item.mode,
                        }))
                      }
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: `1px solid ${active ? '#10B981' : subtleBorder}`,
                        backgroundColor: active
                          ? isDark
                            ? 'rgba(16, 185, 129, 0.16)'
                            : 'rgba(16, 185, 129, 0.08)'
                          : 'transparent',
                        color: textCol,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 750, fontSize: 11.5 }}>{item.title}</div>
                      <div style={{ fontSize: 10.5, color: mutedText, marginTop: 2 }}>{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: COLUMN VARIETY WIZARD & CUSTOM COLUMN BUILDER */}
        {activeTab === 'columns' && (
          <>
            {/* Banded Column Groups & Theme-Aware Coloring Wizard */}
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: cardBg,
                border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.28)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 12, color: isDark ? '#7DD3FC' : '#0369A1' }}>
                  🎨 {isTR ? 'Sütun Grupları & Tema Uyumlu Renkler' : 'Column Groups & Theme Colors'}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 999,
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.12)',
                    color: '#38BDF8',
                  }}
                >
                  {isDark ? '🌙 Dark Palette' : '☀️ Light Palette'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11.5 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={state.enableColumnGroups}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        enableColumnGroups: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    {isTR
                      ? 'Üst Sütun Gruplarını Göster (Banded Column Groups)'
                      : 'Enable Banded Column Groups'}
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={state.inheritGroupColumnColors}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        inheritGroupColumnColors: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    {isTR
                      ? 'Grup Rengini Alt Sütun & Hücrelere Miras Bırak (inheritColumnColors)'
                      : 'Inherit Group Colors to Child Headers & Cells'}
                  </span>
                </label>
              </div>

              {state.enableColumnGroups && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: mutedText }}>
                    {isTR
                      ? 'Grup Renk Paletleri (Dark & Light Otomatik Uyumlu):'
                      : 'Group Color Presets (Auto Dark & Light Adaptive):'}
                  </div>
                  {[
                    { id: 'identity', labelTR: 'Kimlik & Hesap', labelEN: 'Account Identity' },
                    { id: 'organization', labelTR: 'Organizasyon & Bölge', labelEN: 'Organization & Region' },
                    { id: 'financials', labelTR: 'Finansal Metrikler', labelEN: 'Financial Metrics' },
                    { id: 'performance', labelTR: 'Performans & KPI', labelEN: 'Performance & KPI' },
                    { id: 'timeline', labelTR: 'Zaman & Denetim', labelEN: 'Timeline & Audit' },
                    { id: 'contact', labelTR: 'İletişim & Aksiyon', labelEN: 'Contact & Actions' },
                  ].map((grp) => {
                    const currentColor = state.groupColorMap[grp.id] || 'blue';
                    const swatchObj = COLUMN_COLOR_PRESET_LIST.find((p) => p.id === currentColor);
                    return (
                      <div
                        key={grp.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '4px 7px',
                          borderRadius: 6,
                          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.55)' : '#FFFFFF',
                          border: `1px solid ${subtleBorder}`,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700 }}>
                          <span
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              backgroundColor: swatchObj?.swatch || '#38BDF8',
                              flexShrink: 0,
                            }}
                          />
                          <span>{isTR ? grp.labelTR : grp.labelEN}</span>
                        </span>
                        <select
                          value={currentColor}
                          onChange={(e) => {
                            const val = e.target.value as ColumnColorPreset;
                            onChange((prev) => ({
                              ...prev,
                              groupColorMap: {
                                ...prev.groupColorMap,
                                [grp.id]: val,
                              },
                            }));
                          }}
                          style={{
                            padding: '3px 6px',
                            borderRadius: 5,
                            border: `1px solid ${subtleBorder}`,
                            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                            color: textCol,
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {COLUMN_COLOR_PRESET_LIST.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {isTR ? preset.labelTR : preset.labelEN}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <CustomColumnBuilder
              isDark={isDark}
              isTR={isTR}
              existingColumnIds={allColumns.map((c) => c.id)}
              customColumns={customColumns}
              onAddCustomColumn={onAddCustomColumn}
              onRemoveCustomColumn={onRemoveCustomColumn}
            />

            <div
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: cardBg,
                border: `1px solid ${subtleBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 12 }}>
                  {isTR ? 'Sütun Çeşitliliği Sihirbazı' : 'Column Variety Wizard'}
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#8B5CF6' }}>
                  {state.enabledColumnIds.length} / {allColumns.length}{' '}
                  {isTR ? 'Sütun Aktif' : 'Active'}
                </span>
              </div>

              {/* Increase / Decrease Column Variety Stepper */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => stepColumnVariety(-2)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 7,
                    border: `1px solid ${subtleBorder}`,
                    backgroundColor: 'transparent',
                    color: textCol,
                    fontWeight: 750,
                    fontSize: 11.5,
                    cursor: 'pointer',
                  }}
                >
                  − {isTR ? 'Sütun Azalt (-2)' : 'Fewer Columns (-2)'}
                </button>
                <button
                  type="button"
                  onClick={() => stepColumnVariety(2)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 7,
                    border: `1px solid ${subtleBorder}`,
                    backgroundColor: 'transparent',
                    color: textCol,
                    fontWeight: 750,
                    fontSize: 11.5,
                    cursor: 'pointer',
                  }}
                >
                  + {isTR ? 'Sütun Artır (+2)' : 'More Columns (+2)'}
                </button>
              </div>

              {/* Column Presets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {[
                  {
                    id: 'minimal' as ColumnPresetId,
                    label: isTR ? 'Minimal (5 Sütun)' : 'Minimal (5 Cols)',
                  },
                  {
                    id: 'finance' as ColumnPresetId,
                    label: isTR ? 'Finans Çekirdek (10)' : 'Finance Core (10)',
                  },
                  {
                    id: 'enterprise' as ColumnPresetId,
                    label: isTR ? 'Kurumsal (16 Sütun)' : 'Enterprise (16 Cols)',
                  },
                  {
                    id: 'all' as ColumnPresetId,
                    label: isTR ? 'Tüm Sütun Tipleri (25)' : 'All Column Types (25)',
                  },
                ].map((p) => {
                  const active =
                    state.columnPreset === p.id &&
                    state.enabledColumnIds.length === COLUMN_PRESETS[p.id].length;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setColumnPreset(p.id)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 7,
                        border: `1px solid ${active ? '#8B5CF6' : subtleBorder}`,
                        backgroundColor: active
                          ? isDark
                            ? 'rgba(139, 92, 246, 0.2)'
                            : 'rgba(139, 92, 246, 0.1)'
                          : 'transparent',
                        color: active ? (isDark ? '#DDD6FE' : '#6D28D9') : textCol,
                        fontWeight: active ? 800 : 650,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Column Checkboxes */}
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: cardBg,
                border: `1px solid ${subtleBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 11.5, marginBottom: 4 }}>
                {isTR
                  ? 'Tekil Sütun Görünürlüğü & Başlık/Sütun Rengi:'
                  : 'Toggle Columns & Per-Column Header/Cell Color:'}
              </div>
              {allColumns.map((col) => {
                const checked = state.enabledColumnIds.includes(col.id);
                const colOverride = state.columnColorOverrides?.[col.id]?.headerColor || '';
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
                      backgroundColor: checked
                        ? isDark
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(15,23,42,0.03)'
                        : 'transparent',
                      fontSize: 11.5,
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        cursor: 'pointer',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleColumnId(col.id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          fontWeight: checked ? 700 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col.title}
                      </span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <select
                        title={isTR ? 'Bu sütuna özel Başlık & Hücre Rengi ata' : 'Override column Header & Cell color'}
                        value={colOverride}
                        onChange={(e) => {
                          const nextPreset = e.target.value as ColumnColorPreset | '';
                          onChange((prev) => ({
                            ...prev,
                            columnColorOverrides: {
                              ...prev.columnColorOverrides,
                              [col.id]: {
                                headerColor: nextPreset,
                                columnColor: nextPreset,
                              },
                            },
                          }));
                        }}
                        style={{
                          padding: '2px 4px',
                          borderRadius: 4,
                          border: `1px solid ${colOverride ? '#38BDF8' : subtleBorder}`,
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          color: colOverride ? '#38BDF8' : mutedText,
                          fontSize: 9.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">{isTR ? 'Oto Renk' : 'Auto'}</option>
                        {COLUMN_COLOR_PRESET_LIST.map((p) => (
                          <option key={p.id} value={p.id}>
                            🎨 {isTR ? p.labelTR : p.labelEN}
                          </option>
                        ))}
                      </select>
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor: isDark ? '#0F172A' : '#E2E8F0',
                          color: mutedText,
                          fontFamily: 'monospace',
                        }}
                      >
                        {col.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TAB 3: TOOLBAR & DRAWER SETTINGS */}
        {activeTab === 'toolbar' && (
          <>
            {/* Quick Toolbar Profiles */}
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: cardBg,
                border: `1px solid ${subtleBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 12 }}>
                {isTR ? 'Hızlı Toolbar Profilleri' : 'Quick Toolbar Profiles'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => applyToolbarProfile('full')}
                  style={{
                    padding: '6px 6px',
                    borderRadius: 7,
                    border: `1px solid ${subtleBorder}`,
                    backgroundColor: 'transparent',
                    color: textCol,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isTR ? 'Tam Kurumsal' : 'Full Enterprise'}
                </button>
                <button
                  type="button"
                  onClick={() => applyToolbarProfile('minimal')}
                  style={{
                    padding: '6px 6px',
                    borderRadius: 7,
                    border: `1px solid ${subtleBorder}`,
                    backgroundColor: 'transparent',
                    color: textCol,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isTR ? 'Sade (İkon)' : 'Minimal Icons'}
                </button>
                <button
                  type="button"
                  onClick={() => applyToolbarProfile('readonly')}
                  style={{
                    padding: '6px 6px',
                    borderRadius: 7,
                    border: `1px solid ${subtleBorder}`,
                    backgroundColor: 'transparent',
                    color: textCol,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isTR ? 'Salt İzleyici' : 'Read-Only'}
                </button>
              </div>

              {/* Button Display Mode */}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: mutedText, marginBottom: 5 }}>
                  {isTR ? 'Toolbar Buton Görünümü:' : 'Toolbar Button Display Mode:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {(['icon-text', 'icon', 'text'] as ToolbarButtonDisplayMode[]).map((m) => {
                    const active = state.toolbarConfig.buttonDisplayMode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            toolbarConfig: { ...prev.toolbarConfig, buttonDisplayMode: m },
                          }))
                        }
                        style={{
                          padding: '5px 6px',
                          borderRadius: 6,
                          border: `1px solid ${active ? '#38BDF8' : subtleBorder}`,
                          backgroundColor: active
                            ? isDark
                              ? 'rgba(56, 189, 248, 0.18)'
                              : 'rgba(2, 132, 199, 0.1)'
                            : 'transparent',
                          color: active ? '#38BDF8' : textCol,
                          fontSize: 11,
                          fontWeight: active ? 800 : 600,
                          cursor: 'pointer',
                        }}
                      >
                        {m === 'icon-text'
                          ? isTR
                            ? 'İkon + Metin'
                            : 'Icon + Text'
                          : m === 'icon'
                          ? isTR
                            ? 'Sadece İkon'
                            : 'Icon Only'
                          : isTR
                          ? 'Sadece Metin'
                          : 'Text Only'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Individual Toolbar Controls Checklist */}
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: cardBg,
                border: `1px solid ${subtleBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 4 }}>
                {isTR ? 'Toolbar & Grid Bileşenlerini Aç / Kapat' : 'Toolbar & Grid Elements Checklist'}
              </div>

              {(
                [
                  ['visible', isTR ? 'Üst Toolbar Çubuğunu Göster' : 'Show Top Toolbar'],
                  ['showBrand', isTR ? 'SheetGL Logo & Başlık' : 'SheetGL Brand & Title'],
                  ['showAddRow', isTR ? '+ Yeni Satır Ekle Butonu' : '+ Add Row Button'],
                  ['showDuplicateRow', isTR ? 'Satır Kopyala Butonu' : 'Duplicate Row Button'],
                  ['showDeleteRow', isTR ? 'Satır Sil / Çoklu Sil Butonu' : 'Delete Row Button'],
                  ['showUndoRedo', isTR ? 'Geri Al / İleri Al (Undo/Redo)' : 'Undo / Redo Buttons'],
                  ['showSearch', isTR ? 'Genel Arama Kutusu (Global Search)' : 'Global Search Input'],
                  ['showGroupBy', isTR ? 'Sütuna Göre Grupla Seçici' : 'Group By Selector'],
                  ['showClearFilters', isTR ? 'Filtreleri Temizle Butonu' : 'Clear Filters Button'],
                  [
                    'showBatchActions',
                    isTR
                      ? 'Değişiklik Özeti Modalı & Toplu Kaydet'
                      : 'Pending Changes Modal & Batch Save',
                  ],
                  [
                    'showSelectionModeSwitch',
                    isTR
                      ? 'Toolbar Seçim Modu Seçici (Yok/Tekli/Çoklu)'
                      : 'Toolbar Selection Mode Switcher',
                  ],
                  ['showPermissionsSwitch', isTR ? 'Yetki Modu Seçici' : 'Permissions Mode Switcher'],
                  ['showColumnSettings', isTR ? 'Sütunlar Menüsü (Gizle/Sabitle)' : 'Columns Settings Menu'],
                  ['showLocaleSwitch', isTR ? 'Dil Değiştirici (TR / EN)' : 'Language Switcher (TR / EN)'],
                  ['showThemeSwitch', isTR ? 'Tema Değiştirici (Dark / Light)' : 'Theme Switcher'],
                  ['showExportCsv', isTR ? 'CSV Dışa Aktar Butonu' : 'Export CSV Button'],
                ] as [keyof StudioWizardState['toolbarConfig'], string][]
              ).map(([key, label]) => {
                const checked = Boolean(state.toolbarConfig[key]);
                return (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 6px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 11.5,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleToolbarKey(key)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: checked ? 650 : 400 }}>{label}</span>
                  </label>
                );
              })}

              <div style={{ height: 1, backgroundColor: subtleBorder, margin: '6px 0' }} />

              {/* Extra Grid Features */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 6px',
                  fontSize: 11.5,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={state.showFormulaBar}
                  onChange={() =>
                    onChange((prev) => ({ ...prev, showFormulaBar: !prev.showFormulaBar }))
                  }
                />
                <span style={{ fontWeight: 650 }}>
                  {isTR ? 'Formül Çubuğunu Göster (fx)' : 'Show Formula Bar (fx)'}
                </span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 6px',
                  fontSize: 11.5,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={state.showSummaryRow}
                  onChange={() =>
                    onChange((prev) => ({ ...prev, showSummaryRow: !prev.showSummaryRow }))
                  }
                />
                <span style={{ fontWeight: 650 }}>
                  {isTR ? 'Alt Özet & İstatistik Çubuğunu Göster' : 'Show Summary & Stats Footer'}
                </span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 6px',
                  fontSize: 11.5,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={state.lockRejectedRows}
                  onChange={() =>
                    onChange((prev) => ({ ...prev, lockRejectedRows: !prev.lockRejectedRows }))
                  }
                />
                <span style={{ fontWeight: 650, color: '#F59E0B' }}>
                  {isTR
                    ? 'İptal Edilen (Cancelled) Satırları Kilitle'
                    : 'Lock Cancelled Rows (Guard Rule)'}
                </span>
              </label>
            </div>
          </>
        )}

        {/* TAB 4: DIAGNOSTICS & LIVE CONSOLE */}
        {activeTab === 'diagnostics' && (
          <DiagnosticsPanel
            isDark={isDark}
            isTR={isTR}
            activeRowCount={state.rowCount}
            activeColumnCount={state.enabledColumnIds.length}
            selectedRowCount={selectedRowCount}
            datasetFillMode={state.datasetFillMode}
            eventLogs={eventLogs}
            lastSavePayload={lastSavePayload}
            onClearLogs={onClearLogs}
            onRunStressTest={(rows) => setRowCount(rows)}
          />
        )}
      </div>
    </aside>
    </>
  );
};
