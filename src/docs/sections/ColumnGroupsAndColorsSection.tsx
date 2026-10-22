import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../../datagrid/ui/MaterialIcon';
import {
  ColumnColorPreset,
  ColumnDef,
  ColumnGroupDef,
} from '../../datagrid/types/grid';
import { COLUMN_COLOR_PRESET_LIST } from '../../datagrid/theme/ColumnColorEngine';
import { DocThemeColors } from '../types';
import { ALL_COLUMNS_DEMO_DATA, DOC_STATUS_OPTIONS } from '../data/docOptionsAndRows';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { CodeBlock } from '../components/CodeBlock';

export interface ColumnGroupsAndColorsSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const ColumnGroupsAndColorsSection: React.FC<ColumnGroupsAndColorsSectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  const [enableGroups, setEnableGroups] = useState<boolean>(true);
  const [inheritColors, setInheritColors] = useState<boolean>(true);
  const [identityColor, setIdentityColor] = useState<ColumnColorPreset>('indigo');
  const [financeColor, setFinanceColor] = useState<ColumnColorPreset>('emerald');
  const [auditColor, setAuditColor] = useState<ColumnColorPreset>('amber');
  const [customDualThemeCol, setCustomDualThemeCol] = useState<boolean>(true);

  const demoGroups = useMemo<ColumnGroupDef[]>(() => {
    if (!enableGroups) return [];
    return [
      {
        id: 'identity',
        title: isTR ? 'KURUMSAL KİMLİK' : 'ACCOUNT IDENTITY',
        columnIds: ['id', 'code', 'company'],
        color: identityColor,
        inheritColumnColors: inheritColors,
      },
      {
        id: 'financials',
        title: isTR ? 'FİNANSAL METRİKLER' : 'FINANCIAL METRICS',
        columnIds: ['balance', 'yoyGrowth', 'quantity'],
        color: financeColor,
        inheritColumnColors: inheritColors,
      },
      {
        id: 'audit',
        title: isTR ? 'DENETİM & DURUM' : 'AUDIT & STATUS',
        columnIds: ['status', 'date'],
        color: auditColor,
        inheritColumnColors: inheritColors,
      },
    ];
  }, [enableGroups, inheritColors, identityColor, financeColor, auditColor, isTR]);

  const demoColumns = useMemo<ColumnDef[]>(() => {
    return [
      {
        id: 'id',
        title: 'ID',
        type: 'number',
        decimalDigits: 0,
        width: 68,
        pinned: 'left',
        readonly: true,
      },
      {
        id: 'code',
        title: isTR ? 'Hesap Kodu' : 'Account Code',
        type: 'text',
        width: 135,
        pinned: 'left',
      },
      {
        id: 'company',
        title: isTR ? 'Şirket Adı' : 'Company Name',
        type: 'text',
        width: 195,
      },
      {
        id: 'balance',
        title: isTR ? 'Bakiye ($)' : 'Balance ($)',
        type: 'currency',
        width: 155,
        currencySymbol: '$',
        summaryType: 'sum',
        ...(customDualThemeCol
          ? {
              headerColor: {
                light: 'rgba(13, 148, 136, 0.18)',
                dark: 'rgba(45, 212, 191, 0.24)',
              },
              headerTextColor: {
                light: '#115E59',
                dark: '#99F6E4',
              },
              columnColor: {
                light: 'rgba(13, 148, 136, 0.06)',
                dark: 'rgba(45, 212, 191, 0.08)',
              },
              columnTextColor: {
                light: '#0F766E',
                dark: '#5EEAD4',
              },
              style: {
                headerAccent: { light: '#0D9488', dark: '#2DD4BF' },
              },
            }
          : {}),
      },
      {
        id: 'yoyGrowth',
        title: isTR ? 'Büyüme (%)' : 'YoY Growth (%)',
        type: 'percent',
        width: 145,
        showVarianceSign: true,
        summaryType: 'avg',
      },
      {
        id: 'quantity',
        title: isTR ? 'Sipariş (Lot)' : 'Order Lots',
        type: 'number',
        width: 130,
        summaryType: 'sum',
      },
      {
        id: 'status',
        title: isTR ? 'Durum' : 'Status',
        type: 'select',
        width: 140,
        options: DOC_STATUS_OPTIONS,
      },
      {
        id: 'date',
        title: isTR ? 'Kayıt Tarihi' : 'Registered Date',
        type: 'date',
        width: 145,
      },
    ];
  }, [isTR, customDualThemeCol]);

  return (
    <div>
      {/* 1. Interactive Control Panel */}
      <div
        id="cgc-live"
        style={{
          padding: '16px 18px',
          borderRadius: 12,
          backgroundColor: colors.surfaceAlt,
          border: `1px solid ${colors.border}`,
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 13.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MaterialIcon name="palette" size={18} color={colors.accent} />
              {isTR
                ? 'Sütun Grupları & Dark/Light Renk Kontrolü:'
                : 'Column Groups & Dark/Light Color Controls:'}
            </span>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={enableGroups}
                onChange={(e) => setEnableGroups(e.target.checked)}
              />
              <span>
                {isTR ? 'Üst Sütun Grupları (columnGroups)' : 'Banded Column Groups (columnGroups)'}
              </span>
            </label>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={inheritColors}
                onChange={(e) => setInheritColors(e.target.checked)}
              />
              <span>
                {isTR
                  ? 'Grup Rengini Alt Sütunlara Miras Bırak (inheritColumnColors)'
                  : 'Inherit Group Color to Columns (inheritColumnColors)'}
              </span>
            </label>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={customDualThemeCol}
                onChange={(e) => setCustomDualThemeCol(e.target.checked)}
              />
              <span>
                {isTR
                  ? 'Bakiye Sütununa Özel { light, dark } Renk Ata'
                  : 'Custom { light, dark } Override on Balance Column'}
              </span>
            </label>
          </div>
        </div>

        {/* Group Color Pickers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 10,
          }}
        >
          {[
            {
              label: isTR ? '1. Grup: Kurumsal Kimlik' : 'Group 1: Account Identity',
              value: identityColor,
              onChange: setIdentityColor,
            },
            {
              label: isTR ? '2. Grup: Finansal Metrikler' : 'Group 2: Financial Metrics',
              value: financeColor,
              onChange: setFinanceColor,
            },
            {
              label: isTR ? '3. Grup: Denetim & Durum' : 'Group 3: Audit & Status',
              value: auditColor,
              onChange: setAuditColor,
            },
          ].map((g, idx) => {
            const activeSwatch =
              COLUMN_COLOR_PRESET_LIST.find((p) => p.id === g.value)?.swatch || '#38BDF8';
            return (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: activeSwatch,
                    }}
                  />
                  <span>{g.label}</span>
                </span>
                <select
                  value={g.value}
                  onChange={(e) => g.onChange(e.target.value as ColumnColorPreset)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceAlt,
                    color: colors.text,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {COLUMN_COLOR_PRESET_LIST.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isTR ? p.labelTR : p.labelEN} ({p.id})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Demo Grid */}
      <LiveDemoBox
        title={
          isTR
            ? `Canlı Sütun Grupları & ${isDark ? 'Dark (Koyu)' : 'Light (Açık)'} Tema Uyumlu Renklendirme`
            : `Live Banded Column Groups & ${isDark ? 'Dark' : 'Light'} Theme-Aware Coloring`
        }
        subtitle={
          isTR
            ? 'Üstteki grup başlıklarına tıklayarak grubun altındaki tüm sütunları tek tıkla seçebilir; sağ üstten Dark / Light temayı değiştirerek renklerin otomatik uyumunu test edebilirsiniz.'
            : 'Click any top Banded Group Header to select all columns in that group; toggle Dark / Light theme in the top bar to see colors adapt automatically.'
        }
        hints={
          isTR
            ? [
                'Üstteki "FİNANSAL METRİKLER" grup bandına tıklayarak gruptaki tüm sütunları seçin',
                'Yukarıdaki renk seçicilerden grup renklerini değiştirin veya sağ üstten 🌙/☀️ tema geçişi yapın',
              ]
            : [
                'Click the top "FINANCIAL METRICS" group header band to select all columns in that group',
                'Change group color presets above or toggle 🌙/☀️ Dark/Light mode in the top navbar',
              ]
        }
        height={320}
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        data={ALL_COLUMNS_DEMO_DATA}
        columns={demoColumns}
        columnGroups={demoGroups}
        showSummaryFooter={true}
      />

      {/* 2. Banded Column Groups Code */}
      <h3 id="cgc-groups" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
        {isTR
          ? '1. Sütun Grupları Tanımlama (columnGroups & headerGroup)'
          : '1. Defining Banded Column Groups (columnGroups & headerGroup)'}
      </h3>
      <p style={{ fontSize: 13.5, color: colors.muted, marginBottom: 12, lineHeight: 1.6 }}>
        {isTR
          ? 'Sütunları üst bantlar (Banded Header Groups) altında gruplamak için <SheetGL columnGroups={...} /> prop’unu kullanabilir veya doğrudan ColumnDef üzerinde groupId / headerGroup tanımlayabilirsiniz. Grup başlığına atanan color özelliği, inheritColumnColors !== false olduğu sürece alt sütunların başlık (header) ve hücre (column) yüzeylerine temaya uygun tonlarda otomatik miras bırakılır.'
          : 'Group columns under top multi-column header bands either via the <SheetGL columnGroups={...} /> prop or inline on ColumnDef using groupId / headerGroup. Assigning a color to a group automatically cascades theme-adapted header and cell surface tints to its child columns unless inheritColumnColors is set to false.'}
      </p>
      <CodeBlock
        id="cgc-groups-code"
        title="ColumnGroupDef — Banded Column Groups & Group Color Inheritance"
        langBadge="TSX"
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        code={`import { SheetGL, ColumnGroupDef, ColumnDef } from 'sheetgl';

const columnGroups: ColumnGroupDef[] = [
  {
    id: 'identity',
    title: 'KURUMSAL KİMLİK',
    columnIds: ['id', 'code', 'company'],
    // Semantic preset automatically adapts to both Dark and Light themes!
    color: 'indigo',
    inheritColumnColors: true, // Child columns inherit header & cell surface tint
  },
  {
    id: 'financials',
    title: 'FİNANSAL METRİKLER',
    columnIds: ['balance', 'taxRate', 'netBalance'],
    color: 'emerald',
    // Or specify custom Dark/Light group header & child column colors:
    headerColor: { light: '#DCFCE7', dark: 'rgba(16, 185, 129, 0.24)' },
    columnColor: { light: 'rgba(16, 185, 129, 0.04)', dark: 'rgba(16, 185, 129, 0.06)' },
  },
];

const columns: ColumnDef[] = [
  { id: 'id', title: 'ID', type: 'number', width: 70, pinned: 'left' },
  { id: 'code', title: 'Hesap Kodu', type: 'text', width: 130, pinned: 'left' },
  { id: 'company', title: 'Şirket Adı', type: 'text', width: 200 },
  { id: 'balance', title: 'Brüt Bakiye', type: 'currency', width: 150 },
  { id: 'taxRate', title: 'Vergi (%)', type: 'progress', width: 120 },
  { id: 'netBalance', title: 'Net Bakiye', type: 'currency', width: 150 },
  // Inline group definition on ColumnDef is also supported:
  {
    id: 'lastAuditAt',
    title: 'Son Denetim',
    type: 'datetime',
    width: 175,
    headerGroup: { id: 'audit', title: 'DENETİM & UYUMLULUK', color: 'amber' },
  },
];

<SheetGL
  dataSource={rows}
  columns={columns}
  columnGroups={columnGroups}
  groupHeaderHeight={30}
  theme={isDark ? 'apple-dark' : 'apple-light'}
/>`}
      />

      {/* 3. Header & Column Theme-Aware Coloring Code */}
      <h3 id="cgc-colors" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
        {isTR
          ? '2. Dark & Light Tema Uyumlu Başlık (Header) ve Sütun (Column) Renklendirme'
          : '2. Dark & Light Theme-Aware Header & Column Coloring'}
      </h3>
      <p style={{ fontSize: 13.5, color: colors.muted, marginBottom: 12, lineHeight: 1.6 }}>
        {isTR
          ? 'Her bir sütuna veya sütun grubuna 3 farklı yöntemle renk atayabilirsiniz: (1) 13 hazır semantik palet adı ("blue", "emerald", "amber", "rose" vb.), (2) Açık ve koyu tema için ayrı renk nesnesi ({ light: "...", dark: "..." }), veya (3) Tekil HEX/CSS rengi (SheetGL bu rengi Dark ve Light yüzey kontrastına göre otomatik uyarlar).'
          : 'Assign colors to any column header or column body using 3 flexible formats: (1) 13 built-in semantic preset names ("blue", "emerald", "amber", "rose", etc.), (2) Explicit dual-theme objects ({ light: "...", dark: "..." }), or (3) A single HEX/CSS color string (auto-adapted for Dark and Light contrast).'}
      </p>
      <CodeBlock
        id="cgc-colors-code"
        title="ThemeAwareColor — Semantic Presets, { light, dark } Pairs & Granular Styles"
        langBadge="TSX"
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        code={`import { ColumnDef } from 'sheetgl';

const columns: ColumnDef[] = [
  // Yöntem 1: Hazır Semantik Renk Paleti (Dark & Light temada otomatik kontrast)
  {
    id: 'code',
    title: 'Hesap Kodu',
    type: 'text',
    width: 135,
    color: 'indigo', // Hem başlığı (header) hem sütun hücrelerini (column) indigo paletiyle boyar
  },

  // Yöntem 2: Sadece Header Rengi ve Sütun Rengini Ayrı Ayrı Atama
  {
    id: 'status',
    title: 'Durum',
    type: 'select',
    width: 140,
    headerColor: 'amber', // Başlık amber tonunda
    columnColor: 'slate', // Sütun hücreleri hafif slate tonunda
  },

  // Yöntem 3: Dark ve Light Tema İçin Ayrı Özel Renk Nesnesi ({ light, dark })
  {
    id: 'netBalance',
    title: 'Net Bakiye ($)',
    type: 'currency',
    width: 160,
    headerColor: {
      light: '#CCFBF1',                  // Light temada ferah pastel turkuaz başlık
      dark: 'rgba(45, 212, 191, 0.22)',  // Dark temada derin yarı-saydam turkuaz başlık
    },
    headerTextColor: {
      light: '#115E59',
      dark: '#99F6E4',
    },
    columnColor: {
      light: 'rgba(13, 148, 136, 0.05)',
      dark: 'rgba(45, 212, 191, 0.07)',
    },
    columnTextColor: {
      light: '#0F766E',
      dark: '#5EEAD4',
    },
    // İnce ayar: Üst vurgu çizgisi (headerAccent) ve kenarlık rengi (borderColor)
    style: {
      headerAccent: { light: '#0D9488', dark: '#2DD4BF' },
      borderColor: { light: 'rgba(13, 148, 136, 0.25)', dark: 'rgba(45, 212, 191, 0.28)' },
    },
  },
];`}
      />

      {/* 4. 13 Built-In Presets Swatch Grid */}
      <h3 id="cgc-reference" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 10px' }}>
        {isTR
          ? '3. Hazır Semantik Renk Paletleri (ColumnColorPreset) & API Referansı'
          : '3. Built-In Semantic Color Presets (ColumnColorPreset) & API Reference'}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {COLUMN_COLOR_PRESET_LIST.map((preset) => (
          <div
            key={preset.id}
            style={{
              padding: '8px 11px',
              borderRadius: 8,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: preset.swatch,
                  boxShadow: `0 0 0 2px ${ colors.surface }, 0 0 0 3px ${preset.swatch}`,
                }}
              />
              <span style={{ fontWeight: 700, fontSize: 12 }}>
                {isTR ? preset.labelTR : preset.labelEN}
              </span>
            </span>
            <code
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: colors.accent,
                fontFamily: 'monospace',
              }}
            >
              '{preset.id}'
            </code>
          </div>
        ))}
      </div>
    </div>
  );
};
