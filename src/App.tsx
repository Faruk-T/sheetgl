import React, { useMemo, useState, useCallback } from 'react';
import { SheetGL, ColumnDef, GridEventLogEntry } from './datagrid';
import { DocsPortal } from './DocsPortal';
import { LandingPage } from './LandingPage';

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Active',
    bg: '#DCFCE7',
    fg: '#166534',
    darkBg: 'rgba(48, 209, 88, 0.16)',
    darkFg: '#30D158',
  },
  {
    value: 'pending',
    label: 'Pending',
    bg: '#FEF3C7',
    fg: '#92400E',
    darkBg: 'rgba(255, 159, 10, 0.16)',
    darkFg: '#FF9F0A',
  },
  {
    value: 'review',
    label: 'In Review',
    bg: '#E0F2FE',
    fg: '#075985',
    darkBg: 'rgba(10, 132, 255, 0.16)',
    darkFg: '#64D2FF',
  },
  {
    value: 'rejected',
    label: 'Cancelled',
    bg: '#FEE2E2',
    fg: '#991B1B',
    darkBg: 'rgba(255, 69, 58, 0.16)',
    darkFg: '#FF453A',
  },
];

const REGION_POLICIES: Record<string, { taxRate: number; rating: number }> = {
  'new york': { taxRate: 21, rating: 5 },
  'san francisco': { taxRate: 22, rating: 5 },
  london: { taxRate: 19, rating: 4 },
  berlin: { taxRate: 25, rating: 4 },
  tokyo: { taxRate: 23, rating: 5 },
  singapore: { taxRate: 10, rating: 5 },
  sydney: { taxRate: 20, rating: 4 },
  toronto: { taxRate: 18, rating: 4 },
  istanbul: { taxRate: 20, rating: 5 },
};

const SECTOR_BENCHMARKS: Record<string, { quota: number; trend: number[] }> = {
  'enterprise saas': { quota: 88, trend: [30, 45, 52, 68, 74, 85, 95] },
  aerospace: { quota: 76, trend: [40, 42, 55, 60, 58, 72, 80] },
  fintech: { quota: 92, trend: [25, 48, 62, 70, 82, 88, 98] },
  biotechnology: { quota: 68, trend: [20, 35, 30, 55, 62, 70, 75] },
  logistics: { quota: 81, trend: [50, 52, 58, 63, 68, 74, 82] },
  robotics: { quota: 85, trend: [18, 32, 48, 65, 78, 86, 94] },
  'clean energy': { quota: 79, trend: [22, 38, 44, 59, 67, 75, 84] },
};

function generateDemoData(count: number = 10000) {
  const cities = [
    'New York',
    'San Francisco',
    'London',
    'Berlin',
    'Tokyo',
    'Singapore',
    'Sydney',
    'Toronto',
  ];
  const categories = [
    'Enterprise SaaS',
    'Aerospace',
    'FinTech',
    'Biotechnology',
    'Logistics',
    'Robotics',
    'Clean Energy',
  ];
  const companies = [
    'Acme Global Holding',
    'Nexus Cloud Technologies',
    'Apex Logistics International',
    'Vertex BioPharma Labs',
    'Quantum Dynamics Corp.',
    'Hyperion Infrastructure',
    'Starlight AI Robotics',
    'Nova Clean Materials',
    'Horizon Digital Systems',
    'Vanguard Enterprise FinTech',
  ];

  const rows: any[] = [];
  for (let i = 1; i <= count; i++) {
    const city = cities[i % cities.length];
    const category = categories[i % categories.length];
    const status = STATUS_OPTIONS[i % STATUS_OPTIONS.length];
    const company = `${companies[i % companies.length]} #${i}`;
    const balance = Math.round((Math.sin(i) * 50000 + 65000) * 100) / 100;
    const taxRate = REGION_POLICIES[city.toLowerCase()]?.taxRate ?? 20;
    const netBalance = Math.round(balance * (1 - taxRate / 100) * 100) / 100;
    const progress = (i * 7) % 101;
    const rating = (i % 5) + 1;
    const isApproved = i % 3 === 0;

    const sparkline = [
      Math.round(Math.abs(Math.sin(i) * 50) + 10),
      Math.round(Math.abs(Math.cos(i) * 60) + 15),
      Math.round(Math.abs(Math.sin(i + 1) * 80) + 20),
      Math.round(Math.abs(Math.cos(i + 2) * 45) + 30),
      Math.round(Math.abs(Math.sin(i + 3) * 95) + 25),
      Math.round(Math.abs(Math.cos(i + 4) * 70) + 40),
      Math.round(Math.abs(Math.sin(i + 5) * 85) + 50),
    ];

    const yr = 2025;
    const mon = String((i % 12) + 1).padStart(2, '0');
    const day = String((i % 28) + 1).padStart(2, '0');

    rows.push({
      id: i,
      code: `ACC-${100000 + i}`,
      company,
      city,
      category,
      status: status.value,
      balance,
      taxRate,
      netBalance,
      rating,
      progress,
      sparkline,
      date: `${yr}-${mon}-${day}`,
      isApproved,
    });
  }
  return rows;
}

export function App() {
  const [activeView, setActiveView] = useState<'studio' | 'landing' | 'docs'>('studio');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [showEventDrawer, setShowEventDrawer] = useState<boolean>(false);
  const [lockRejectedRows, setLockRejectedRows] = useState<boolean>(false);
  const [selectedRecordModal, setSelectedRecordModal] = useState<Record<string, any> | null>(null);
  const [eventLogs, setEventLogs] = useState<GridEventLogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      eventName: 'onInitialized',
      summary: 'SheetGL v2.0 Enterprise ready (10,000 rows, Cascading Backend Triggers active)',
      status: 'info',
    },
  ]);

  const [data] = useState(() => generateDemoData(10000));

  const pushEventLog = useCallback(
    (eventName: string, summary: string, status: 'info' | 'success' | 'warning' | 'async' = 'info') => {
      setEventLogs((prev) => [
        {
          id: `${Date.now()}_${Math.random()}`,
          timestamp: new Date().toLocaleTimeString(),
          eventName,
          summary,
          status,
        },
        ...prev.slice(0, 59),
      ]);
    },
    []
  );

  const columns = useMemo<ColumnDef[]>(
    () => [
      {
        id: 'id',
        title: 'ID',
        type: 'number',
        width: 68,
        pinned: 'left',
        readonly: true,
        permission: 'readonly',
        sortable: true,
        filterable: true,
      },
      {
        id: 'code',
        title: lang === 'tr' ? 'Hesap Kodu' : 'Account Code',
        type: 'text',
        width: 120,
        pinned: 'left',
        sortable: true,
        filterable: true,
      },
      {
        id: 'company',
        title: lang === 'tr' ? 'Şirket / Organizasyon' : 'Company / Organization',
        type: 'text',
        width: 230,
        pinned: 'left',
        sortable: true,
        filterable: true,
      },
      {
        id: 'city',
        title: lang === 'tr' ? 'Bölge / Şehir ⚡' : 'Region / City ⚡',
        type: 'text',
        width: 135,
        sortable: true,
        filterable: true,
        groupable: true,
        // DevExtreme-style Async Backend Cascading Lookup:
        // Changing 'city' fetches tax policy & trust score from backend and updates taxRate, netBalance & rating!
        setCellValue: async (newData, newCity, currentRow) => {
          pushEventLog(
            'setCellValue (Backend API)',
            `Fetching regional tax & trust policy for city "${newCity}"...`,
            'async'
          );
          await new Promise((r) => setTimeout(r, 220));
          const policy = REGION_POLICIES[String(newCity ?? '').trim().toLowerCase()] || {
            taxRate: 18,
            rating: 4,
          };
          const bal = Number(currentRow.balance) || 0;
          const net = Math.round(bal * (1 - policy.taxRate / 100) * 100) / 100;
          newData.taxRate = policy.taxRate;
          newData.netBalance = net;
          newData.rating = policy.rating;
          pushEventLog(
            'setCellValue (Resolved)',
            `Row #${currentRow.id} auto-updated from backend -> taxRate: ${policy.taxRate}%, netBalance: $${net.toLocaleString()}`,
            'success'
          );
        },
      },
      {
        id: 'category',
        title: lang === 'tr' ? 'Sektör ⚡' : 'Industry Sector ⚡',
        type: 'text',
        width: 150,
        sortable: true,
        filterable: true,
        groupable: true,
        // Changing 'category' fetches sector quota & 7-day trend from backend!
        setCellValue: async (newData, newCategory, currentRow) => {
          pushEventLog(
            'setCellValue (Backend API)',
            `Fetching sector benchmark for "${newCategory}"...`,
            'async'
          );
          await new Promise((r) => setTimeout(r, 200));
          const bench = SECTOR_BENCHMARKS[String(newCategory ?? '').trim().toLowerCase()] || {
            quota: 75,
            trend: [30, 45, 50, 62, 70, 78, 85],
          };
          newData.progress = bench.quota;
          newData.sparkline = [...bench.trend];
          pushEventLog(
            'setCellValue (Resolved)',
            `Row #${currentRow.id} sector benchmark applied -> progress: ${bench.quota}%`,
            'success'
          );
        },
      },
      {
        id: 'status',
        title: lang === 'tr' ? 'Durum ⚡' : 'Status ⚡',
        type: 'select',
        width: 135,
        sortable: true,
        filterable: true,
        groupable: true,
        options: STATUS_OPTIONS,
        // Changing 'status' cascades to 'isApproved' and 'progress'
        setCellValue: (newData, newStatus) => {
          if (newStatus === 'active') {
            newData.isApproved = true;
          } else if (newStatus === 'rejected') {
            newData.isApproved = false;
            newData.progress = 0;
          }
        },
      },
      {
        id: 'balance',
        title: lang === 'tr' ? 'Brüt Bakiye ($) ⚡' : 'Gross Balance ($) ⚡',
        type: 'currency',
        width: 150,
        currencySymbol: '$',
        decimalDigits: 2,
        sortable: true,
        filterable: true,
        summaryType: 'sum',
        setCellValue: (newData, newBalance, currentRow) => {
          const tax = Number(currentRow.taxRate) || 0;
          newData.netBalance = Math.round(Number(newBalance) * (1 - tax / 100) * 100) / 100;
        },
      },
      {
        id: 'taxRate',
        title: lang === 'tr' ? 'Vergi (%) ⚡' : 'Tax (%) ⚡',
        type: 'progress',
        width: 110,
        sortable: true,
        filterable: true,
        summaryType: 'avg',
        setCellValue: (newData, newTax, currentRow) => {
          const bal = Number(currentRow.balance) || 0;
          newData.netBalance = Math.round(bal * (1 - Number(newTax) / 100) * 100) / 100;
        },
      },
      {
        id: 'netBalance',
        title: lang === 'tr' ? 'Net Bakiye ($)' : 'Net Balance ($)',
        type: 'currency',
        width: 150,
        currencySymbol: '$',
        decimalDigits: 2,
        readonly: true,
        permission: 'readonly',
        sortable: true,
        filterable: true,
        summaryType: 'sum',
      },
      {
        id: 'isApproved',
        title: lang === 'tr' ? 'Onaylı' : 'Approved',
        type: 'boolean',
        width: 90,
        sortable: true,
        filterable: true,
      },
      {
        id: 'rating',
        title: lang === 'tr' ? 'Güven Skoru' : 'Trust Score',
        type: 'rating',
        width: 125,
        sortable: true,
        filterable: true,
        summaryType: 'avg',
      },
      {
        id: 'progress',
        title: lang === 'tr' ? 'Hedef Kota' : 'Target Quota',
        type: 'progress',
        width: 125,
        sortable: true,
        filterable: true,
        summaryType: 'avg',
      },
      {
        id: 'sparkline',
        title: lang === 'tr' ? '7 Günlük Trend' : '7-Day Trend',
        type: 'sparkline',
        width: 135,
        sparklineColor: '#38BDF8',
      },
      {
        id: 'date',
        title: lang === 'tr' ? 'Kayıt Tarihi' : 'Registered Date',
        type: 'date',
        width: 135,
        sortable: true,
        filterable: true,
      },
      {
        id: 'actions',
        title: lang === 'tr' ? 'Detay' : 'Actions',
        type: 'action',
        width: 95,
        buttonText: lang === 'tr' ? 'İncele' : 'Inspect',
        onActionClick: (row) => {
          setSelectedRecordModal(row);
        },
      },
    ],
    [lang, pushEventLog]
  );

  const isTR = lang === 'tr';

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#0B0F17' : '#F8FAFC',
        color: isDark ? '#F9FAFB' : '#0F172A',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* GLOBAL NAVIGATION HEADER */}
      <header
        style={{
          height: 46,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderBottom: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
          flexShrink: 0,
          zIndex: 250,
          userSelect: 'none',
        }}
      >
        {/* Left: Brand & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14 }}>
            <span
              style={{
                padding: '3px 7px',
                borderRadius: 6,
                background: 'linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              SGL
            </span>
            <span>SheetGL Pro</span>
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 99,
                backgroundColor: isDark ? 'rgba(56,189,248,0.15)' : 'rgba(2,132,199,0.1)',
                color: isDark ? '#38BDF8' : '#0284C7',
                fontWeight: 700,
              }}
            >
              v2.0 Enterprise
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {(
              [
                { id: 'studio', labelTr: '📊 Excel Stüdyo (Canlı Tablo)', labelEn: '📊 Excel Studio (Live Grid)' },
                { id: 'landing', labelTr: '🚀 Tanıtım (Landing Page)', labelEn: '🚀 Landing Page' },
                { id: 'docs', labelTr: '📚 Dokümantasyon (Docs)', labelEn: '📚 Documentation' },
              ] as const
            ).map((tab) => {
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 7,
                    border: 'none',
                    backgroundColor: active
                      ? isDark
                        ? '#1E293B'
                        : '#E2E8F0'
                      : 'transparent',
                    color: active
                      ? isDark
                        ? '#38BDF8'
                        : '#0284C7'
                      : isDark
                      ? '#94A3B8'
                      : '#64748B',
                    fontWeight: active ? 700 : 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {isTR ? tab.labelTr : tab.labelEn}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Event Trigger Drawer Toggle, Conditional Rule Toggle, Language & Dark/Light Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeView === 'studio' && (
            <>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: lockRejectedRows
                    ? 'rgba(245, 158, 11, 0.16)'
                    : isDark
                    ? '#1E293B'
                    : '#F1F5F9',
                  color: lockRejectedRows ? '#F59E0B' : isDark ? '#CBD5E1' : '#334155',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title={
                  isTR
                    ? 'Aktif edildiğinde Durumu "Cancelled" olan satırlar onEditingStart tetikleyicisi ile kilitlenir.'
                    : 'When checked, rows with Status = Cancelled are locked via onEditingStart.'
                }
              >
                <input
                  type="checkbox"
                  checked={lockRejectedRows}
                  onChange={(e) => setLockRejectedRows(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>
                  {isTR
                    ? 'Kural: İptal Edilen Satırları Kilitle'
                    : 'Rule: Lock Cancelled Rows'}
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowEventDrawer((v) => !v)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: `1px solid ${showEventDrawer ? '#38BDF8' : isDark ? '#334155' : '#CBD5E1'}`,
                  backgroundColor: showEventDrawer
                    ? isDark
                      ? 'rgba(56, 189, 248, 0.16)'
                      : 'rgba(2, 132, 199, 0.1)'
                    : 'transparent',
                  color: showEventDrawer ? '#38BDF8' : isDark ? '#E2E8F0' : '#1E293B',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚡ {isTR ? `Event Trigger Konsolu (${eventLogs.length})` : `Event Triggers (${eventLogs.length})`}
              </button>
            </>
          )}

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLang((l) => (l === 'tr' ? 'en' : 'tr'))}
            style={{
              padding: '5px 10px',
              borderRadius: 7,
              border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              color: isDark ? '#F9FAFB' : '#0F172A',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {lang === 'tr' ? '🇹🇷 TR' : '🇺🇸 EN'}
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            style={{
              padding: '5px 12px',
              borderRadius: 7,
              border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              color: isDark ? '#FBBF24' : '#0F172A',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTENT */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {activeView === 'studio' && (
          <>
            <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
              <SheetGL
                dataSource={data}
                columns={columns}
                theme={isDark ? 'apple-dark' : 'apple-light'}
                locale={lang}
                batchEditMode={true}
                onEditingStart={(e) => {
                  if (lockRejectedRows && e.row.status === 'rejected' && e.column.id !== 'status') {
                    e.cancel = true;
                    pushEventLog(
                      'onEditingStart (Canceled)',
                      `Row #${e.rowKey} is Cancelled -> editing "${e.column.title}" blocked!`,
                      'warning'
                    );
                  } else {
                    pushEventLog(
                      'onEditingStart',
                      `Editing started on Row #${e.rowKey} [${e.column.id}]`,
                      'info'
                    );
                  }
                }}
                onCellValueChanging={(e) => {
                  if (e.column.id === 'balance' && Number(e.newValue) < 0) {
                    e.cancel = true;
                    e.errorMessage = isTR
                      ? 'Brüt bakiye negatif olamaz!'
                      : 'Gross balance cannot be negative!';
                    pushEventLog(
                      'onCellValueChanging (Rejected)',
                      `Negative balance (${e.newValue}) rejected on Row #${e.rowKey}`,
                      'warning'
                    );
                  }
                }}
                onCellValueChanged={(e) => {
                  pushEventLog(
                    'onCellValueChanged',
                    `Row #${e.rowKey} [${e.column.id}]: "${e.oldValue}" → "${e.newValue}"`,
                    'success'
                  );
                }}
                onRowInserted={(e) => {
                  pushEventLog('onRowInserted', `New row created with ID #${e.key}`, 'success');
                }}
                onRowRemoved={(e) => {
                  pushEventLog('onRowRemoved', `Row #${e.key} removed`, 'warning');
                }}
                onSaving={(e) => {
                  const total =
                    (e.changes.inserted?.length || 0) +
                    (e.changes.updated?.length || 0) +
                    (e.changes.deleted?.length || 0);
                  pushEventLog(
                    'onSaving (Batch Request)',
                    `Sending batch payload (${total} changes) to backend...`,
                    'async'
                  );
                }}
                onSaved={(e) => {
                  pushEventLog(
                    'onSaved (Batch Committed)',
                    `Committed ${e.changes.inserted?.length || 0} inserted, ${e.changes.updated?.length || 0} updated, ${e.changes.deleted?.length || 0} deleted`,
                    'success'
                  );
                }}
              />
            </div>

            {/* LIVE DEVEXTREME EVENT TRIGGER & CASCADING BACKEND CONSOLE DRAWER */}
            {showEventDrawer && (
              <aside
                style={{
                  width: 350,
                  height: '100%',
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderLeft: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  flexShrink: 0,
                  zIndex: 160,
                }}
              >
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>
                      ⚡ {isTR ? 'DevExtreme Event & Backend Log' : 'DevExtreme Event & Backend Log'}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>
                      {isTR
                        ? 'Şehir, Sektör veya Bakiye değiştirerek canlı izleyin'
                        : 'Edit City, Sector, or Balance to see cascading updates'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEventLogs([])}
                    style={{
                      padding: '3px 8px',
                      fontSize: 11,
                      borderRadius: 5,
                      border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                      backgroundColor: 'transparent',
                      color: isDark ? '#CBD5E1' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {isTR ? 'Temizle' : 'Clear'}
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    fontFamily: 'monospace',
                    fontSize: 11,
                  }}
                >
                  {eventLogs.map((log) => {
                    const color =
                      log.status === 'success'
                        ? '#10B981'
                        : log.status === 'warning'
                        ? '#F59E0B'
                        : log.status === 'async'
                        ? '#38BDF8'
                        : '#94A3B8';
                    return (
                      <div
                        key={log.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 7,
                          backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 3,
                            fontWeight: 700,
                            color,
                          }}
                        >
                          <span>{log.eventName}</span>
                          <span style={{ opacity: 0.7 }}>{log.timestamp}</span>
                        </div>
                        <div style={{ color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.4 }}>
                          {log.summary}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            )}
          </>
        )}

        {activeView === 'landing' && (
          <LandingPage
            isDark={isDark}
            lang={lang}
            demoData={data}
            demoColumns={columns}
            onOpenStudio={() => setActiveView('studio')}
            onOpenDocs={() => setActiveView('docs')}
          />
        )}

        {activeView === 'docs' && (
          <DocsPortal
            isDark={isDark}
            lang={lang}
            onOpenStudio={() => setActiveView('studio')}
          />
        )}

        {/* INSPECT RECORD MODAL (Action Column Callback) */}
        {selectedRecordModal && (
          <div
            onMouseDown={() => setSelectedRecordModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              zIndex: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: 420,
                padding: 22,
                borderRadius: 14,
                backgroundColor: isDark ? '#111827' : '#FFFFFF',
                color: isDark ? '#F9FAFB' : '#0F172A',
                border: `1px solid ${isDark ? '#1F2937' : '#E2E8F0'}`,
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${isDark ? '#1F2937' : '#E2E8F0'}`,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 15 }}>
                  📋 {isTR ? 'Kayıt Detayı' : 'Record Inspector'} (#{selectedRecordModal.id})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRecordModal(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: 8, fontSize: 13 }}>
                <span style={{ color: '#94A3B8' }}>Code:</span>
                <strong>{selectedRecordModal.code}</strong>
                <span style={{ color: '#94A3B8' }}>Company:</span>
                <strong>{selectedRecordModal.company}</strong>
                <span style={{ color: '#94A3B8' }}>City:</span>
                <strong>{selectedRecordModal.city}</strong>
                <span style={{ color: '#94A3B8' }}>Sector:</span>
                <strong>{selectedRecordModal.category}</strong>
                <span style={{ color: '#94A3B8' }}>Status:</span>
                <strong>{selectedRecordModal.status}</strong>
                <span style={{ color: '#94A3B8' }}>Gross Balance:</span>
                <strong>${Number(selectedRecordModal.balance).toLocaleString()}</strong>
                <span style={{ color: '#94A3B8' }}>Tax Rate:</span>
                <strong>{selectedRecordModal.taxRate}%</strong>
                <span style={{ color: '#94A3B8' }}>Net Balance:</span>
                <strong style={{ color: '#10B981' }}>
                  ${Number(selectedRecordModal.netBalance).toLocaleString()}
                </strong>
                <span style={{ color: '#94A3B8' }}>Date:</span>
                <strong>{selectedRecordModal.date}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
