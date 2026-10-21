import React, { useState } from 'react';
import { MaterialIcon } from '../../datagrid/ui/MaterialIcon';
import { GridSummaryConfig, ToolbarButtonDisplayMode } from '../../datagrid/types/grid';
import { DocThemeColors } from '../types';
import { ALL_COLUMNS_DEMO_DATA, DOC_STATUS_OPTIONS } from '../data/docOptionsAndRows';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { CodeBlock } from '../components/CodeBlock';

export interface ToolbarSummarySectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const ToolbarSummarySection: React.FC<ToolbarSummarySectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  const [toolbarModeDemo, setToolbarModeDemo] = useState<ToolbarButtonDisplayMode>('icon-text');
  const [summaryDemoConfig, setSummaryDemoConfig] = useState<GridSummaryConfig>({
    visible: true,
    showTotalCount: true,
    showSelectionStats: true,
    showColumnSummaries: true,
    allowConfiguration: true,
  });

  return (
    <div>
      {/* Interactive Control Panel */}
      <div
        id="tb-live"
        style={{
          padding: '16px 18px',
          borderRadius: 12,
          backgroundColor: colors.surfaceAlt,
          border: `1px solid ${colors.border}`,
          marginBottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: 13.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MaterialIcon name="smart_button" size={18} color={colors.accent} />
            {isTR ? 'Toolbar Buton Modu:' : 'Toolbar Button Mode:'}
          </span>
          {(
            [
              {
                mode: 'icon' as ToolbarButtonDisplayMode,
                icon: 'apps',
                label: isTR ? "Sadece İkon ('icon')" : "Icon Only ('icon')",
              },
              {
                mode: 'icon-text' as ToolbarButtonDisplayMode,
                icon: 'view_sidebar',
                label: isTR ? "İkon + Metin ('icon-text')" : "Icon + Text ('icon-text')",
              },
              {
                mode: 'text' as ToolbarButtonDisplayMode,
                icon: 'text_fields',
                label: isTR ? "Sadece Metin ('text')" : "Text Only ('text')",
              },
            ] as const
          ).map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => setToolbarModeDemo(m.mode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                border: `1px solid ${toolbarModeDemo === m.mode ? colors.accent : colors.border}`,
                backgroundColor: toolbarModeDemo === m.mode ? colors.accentBg : colors.surface,
                color: toolbarModeDemo === m.mode ? colors.accent : colors.text,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              <MaterialIcon
                name={m.icon}
                size={15}
                color={toolbarModeDemo === m.mode ? colors.accent : undefined}
              />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            fontSize: 12.5,
          }}
        >
          <span style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <MaterialIcon name="functions" size={17} color={colors.accent} />
            {isTR ? 'Özet Satırı (Summary Row):' : 'Summary Row:'}
          </span>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={summaryDemoConfig.visible !== false}
              onChange={(e) => setSummaryDemoConfig((p) => ({ ...p, visible: e.target.checked }))}
            />
            <span>{isTR ? 'Görünür' : 'Visible'}</span>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={summaryDemoConfig.showTotalCount !== false}
              onChange={(e) =>
                setSummaryDemoConfig((p) => ({ ...p, showTotalCount: e.target.checked }))
              }
            />
            <span>{isTR ? 'Toplam Kayıt' : 'Total Count'}</span>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={summaryDemoConfig.showSelectionStats !== false}
              onChange={(e) =>
                setSummaryDemoConfig((p) => ({ ...p, showSelectionStats: e.target.checked }))
              }
            />
            <span>{isTR ? 'Seçim İstatistiği' : 'Selection Stats'}</span>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={summaryDemoConfig.showColumnSummaries !== false}
              onChange={(e) =>
                setSummaryDemoConfig((p) => ({ ...p, showColumnSummaries: e.target.checked }))
              }
            />
            <span>{isTR ? 'Sütun Özetleri' : 'Column Summaries'}</span>
          </label>
        </div>
      </div>

      <LiveDemoBox
        title={
          isTR
            ? `Canlı Toolbar (${toolbarModeDemo.toUpperCase()}) & Summary Row Örneği`
            : `Live Toolbar (${toolbarModeDemo.toUpperCase()}) & Summary Row Playground`
        }
        subtitle={
          isTR
            ? 'Yukarıdaki butonlardan veya doğrudan tablo Toolbar’ı üzerindeki İkon / İkon+Metin / Metin seçicisinden ve Ayarlar menüsünden görünümü canlı değiştirin.'
            : 'Switch between Icon, Icon+Text, and Text modes using the buttons above or directly inside the grid Toolbar and Configure menu.'
        }
        hints={
          isTR
            ? [
                'Toolbar üzerindeki [İkon | İkon+Metin | Metin] butonlarıyla görünüm modunu değiştirin',
                'Alt barda "Özet Satırı Ayarları" butonuna tıklayarak SUM / AVG / MIN / MAX / COUNT hesaplamalarını yapılandırın',
              ]
            : [
                'Click [Icon | Icon+Text | Text] in the toolbar to switch button display mode on the fly',
                'Click "Summary Settings" in the bottom footer to configure SUM / AVG / MIN / MAX / COUNT aggregations',
              ]
        }
        height={310}
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        toolbar={{
          visible: true,
          buttonDisplayMode: toolbarModeDemo,
          allowDisplayModeSwitch: true,
          showBrand: false,
          showGroupBy: false,
          showPermissionsSwitch: false,
          showLocaleSwitch: false,
          showThemeSwitch: false,
          customItems: [
            {
              id: 'sync-erp',
              label: isTR ? 'ERP Yenile' : 'Sync ERP',
              icon: 'sync',
              position: 'left',
              variant: 'primary',
              onClick: () =>
                alert(isTR ? 'ERP verileri senkronize edildi!' : 'ERP dataset synchronized!'),
            },
          ],
        }}
        summaryRow={{
          ...summaryDemoConfig,
          items: [
            {
              columnId: 'balance',
              summaryType: 'sum',
              label: isTR ? 'Toplam Bakiye' : 'Total Balance',
            },
            {
              columnId: 'yoyGrowth',
              summaryType: 'avg',
              label: isTR ? 'Ort. Büyüme' : 'Avg Growth',
              suffix: '%',
            },
            {
              columnId: 'quantity',
              summaryType: 'sum',
              label: isTR ? 'Toplam Lot' : 'Total Qty',
            },
          ],
        }}
        data={ALL_COLUMNS_DEMO_DATA}
        columns={[
          { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
          { id: 'code', title: isTR ? 'Hesap Kodu' : 'Account Code', type: 'text', width: 135 },
          { id: 'company', title: isTR ? 'Şirket Adı' : 'Company Name', type: 'text', width: 190 },
          { id: 'quantity', title: isTR ? 'Sipariş (Lot)' : 'Order Qty', type: 'number', width: 135, summaryType: 'sum' },
          { id: 'balance', title: isTR ? 'Bakiye ($)' : 'Balance ($)', type: 'currency', width: 155, currencySymbol: '$', summaryType: 'sum' },
          { id: 'yoyGrowth', title: isTR ? 'YoY Büyüme (%)' : 'YoY Growth (%)', type: 'percent', width: 150, showVarianceSign: true, summaryType: 'avg' },
          { id: 'status', title: isTR ? 'Durum' : 'Status', type: 'select', width: 135, options: DOC_STATUS_OPTIONS },
        ]}
      />

      <h3 id="tb-modes" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
        {isTR
          ? 'Toolbar Yapılandırması & Buton Görünüm Modları (icon | icon-text | text)'
          : 'Toolbar Configuration & Button Display Modes (icon | icon-text | text)'}
      </h3>
      <CodeBlock
        id="tb-config-code"
        title="GridToolbarConfig — icon, icon-text, text & Custom Items"
        langBadge="TSX"
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        code={`import { SheetGL } from 'sheetgl';

<SheetGL
  dataSource={rows}
  columns={columns}
  toolbar={{
    visible: true,
    // 'icon' (Google Icon only) | 'icon-text' (Icon + Text) | 'text' (Text only)
    buttonDisplayMode: 'icon-text',
    allowDisplayModeSwitch: true,
    showAddRow: true,
    showDuplicateRow: true,
    showDeleteRow: true,
    showUndoRedo: true,
    showSearch: true,
    showGroupBy: true,
    showPermissionsSwitch: true,
    showColumnSettings: true,
    showExportCsv: true,
    // Custom toolbar actions using Google Material Symbols (https://fonts.google.com/icons):
    customItems: [
      {
        id: 'sync-btn',
        label: 'Sync ERP',
        icon: 'sync', // Google Material Symbols ligature name
        position: 'left',
        variant: 'primary',
        onClick: () => console.log('Sync triggered'),
      },
      {
        id: 'print-btn',
        label: 'Print',
        icon: 'print',
        position: 'right',
        displayMode: 'icon',
        onClick: () => window.print(),
      },
    ],
  }}
/>`}
      />

      <h3 id="tb-summary" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
        {isTR
          ? 'Summary Row (Alt Özet Satırı) Yapılandırması'
          : 'Summary Row Configuration (GridSummaryConfig)'}
      </h3>
      <CodeBlock
        id="sum-config-code"
        title="GridSummaryConfig — Summary Footer & Column Aggregations"
        langBadge="TSX"
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        code={`<SheetGL
  dataSource={rows}
  columns={columns}
  summaryRow={{
    visible: true,
    showTotalCount: true,
    showSelectionStats: true,
    selectionMetrics: ['count', 'sum', 'avg', 'min', 'max'],
    showColumnSummaries: true,
    allowConfiguration: true,
    items: [
      { columnId: 'balance', summaryType: 'sum', label: 'Total Balance', decimalDigits: 2 },
      { columnId: 'yoyGrowth', summaryType: 'avg', label: 'Avg Growth', suffix: '%' },
      { columnId: 'id', summaryType: 'count', label: 'Record Count' },
    ],
  }}
/>`}
      />

      <h3 id="tb-icons" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
        {isTR
          ? 'Google Fonts Material Symbols (<MaterialIcon />) Kullanımı'
          : 'Using Google Fonts Material Symbols (<MaterialIcon />)'}
      </h3>
      <CodeBlock
        id="mat-icon-code"
        title="MaterialIcon Component (https://fonts.google.com/icons)"
        langBadge="TSX"
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        code={`import { MaterialIcon } from 'sheetgl';

// Render any icon from https://fonts.google.com/icons by its ligature name:
<MaterialIcon name="add_circle" size={18} color="#10B981" />
<MaterialIcon name="functions" size={16} color="#38BDF8" />
<MaterialIcon name="filter_alt" size={16} filled={true} />`}
      />
    </div>
  );
};
