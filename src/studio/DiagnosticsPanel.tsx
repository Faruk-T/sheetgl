import React, { useEffect, useState } from 'react';
import { GridEventLogEntry } from '../datagrid';

export interface DiagnosticsPanelProps {
  isDark: boolean;
  isTR: boolean;
  activeRowCount: number;
  activeColumnCount: number;
  selectedRowCount: number;
  datasetFillMode: string;
  eventLogs: GridEventLogEntry[];
  lastSavePayload?: any;
  onClearLogs: () => void;
  onRunStressTest: (rows: number) => void;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  isDark,
  isTR,
  activeRowCount,
  activeColumnCount,
  selectedRowCount,
  datasetFillMode,
  eventLogs,
  lastSavePayload,
  onClearLogs,
  onRunStressTest,
}) => {
  const [fps, setFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLatestPayloadCard, setShowLatestPayloadCard] = useState<boolean>(true);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      frameCount++;
      const elapsed = now - lastTime;
      if (elapsed >= 500) {
        const currentFps = Math.min(144, Math.round((frameCount * 1000) / elapsed));
        const avgFrame = Number((elapsed / Math.max(1, frameCount)).toFixed(1));
        setFps(currentFps);
        setFrameTimeMs(avgFrame);
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const estimatedMemMb = Number(
    ((activeRowCount * activeColumnCount * 28) / (1024 * 1024) + 2.4).toFixed(1)
  );

  const cardBg = isDark ? '#1E293B' : '#F1F5F9';
  const borderCol = isDark ? '#334155' : '#E2E8F0';
  const mutedText = isDark ? '#94A3B8' : '#64748B';

  const copyJson = (id: string, data: any) => {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(jsonStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* Live Telemetry Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}
      >
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            backgroundColor: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: mutedText }}>
            {isTR ? 'CANLI FPS / KARE SÜRESİ' : 'LIVE FPS / FRAME TIME'}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: fps >= 50 ? '#10B981' : fps >= 30 ? '#F59E0B' : '#EF4444',
              marginTop: 2,
            }}
          >
            {fps} FPS{' '}
            <span style={{ fontSize: 11, fontWeight: 600, color: mutedText }}>
              ({frameTimeMs} ms)
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            backgroundColor: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: mutedText }}>
            {isTR ? 'AKTİF MATRİS HÜCRESİ' : 'ACTIVE MATRIX CELLS'}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#38BDF8', marginTop: 2 }}>
            {(activeRowCount * activeColumnCount).toLocaleString()}
          </div>
          <div style={{ fontSize: 10.5, color: mutedText }}>
            {activeRowCount.toLocaleString()} × {activeColumnCount} {isTR ? 'sütun' : 'cols'}
          </div>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            backgroundColor: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: mutedText }}>
            {isTR ? 'SEÇİLİ SATIRLAR' : 'SELECTED ROWS'}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#A855F7', marginTop: 2 }}>
            {selectedRowCount.toLocaleString()}
          </div>
          <div style={{ fontSize: 10.5, color: mutedText }}>
            {isTR ? 'Durum:' : 'Fill:'} {datasetFillMode.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            backgroundColor: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: mutedText }}>
            {isTR ? 'TAHMİNİ BELLEK (HEAP)' : 'EST. MEMORY FOOTPRINT'}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#F59E0B', marginTop: 2 }}>
            ~{estimatedMemMb} MB
          </div>
          <div style={{ fontSize: 10.5, color: mutedText }}>Canvas 2D Virtual Viewport</div>
        </div>
      </div>

      {/* LATEST SAVE / BATCH JSON PAYLOAD INSPECTOR CARD */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.06)',
          border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.38)' : 'rgba(168, 85, 247, 0.28)'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div
            onClick={() => setShowLatestPayloadCard((v) => !v)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>📦</span>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: isDark ? '#E9D5FF' : '#6B21A8' }}>
              {isTR
                ? 'Save / Batch Gönderilen JSON Payload'
                : 'Last Save / Batch JSON Payload'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {lastSavePayload && (
              <button
                type="button"
                onClick={() => copyJson('latest-save', lastSavePayload)}
                style={{
                  padding: '2px 8px',
                  borderRadius: 5,
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  backgroundColor: 'rgba(168, 85, 247, 0.18)',
                  color: isDark ? '#E9D5FF' : '#6B21A8',
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copiedId === 'latest-save'
                  ? isTR
                    ? '✓ Kopyalandı'
                    : '✓ Copied'
                  : isTR
                  ? 'JSON Kopyala'
                  : 'Copy JSON'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowLatestPayloadCard((v) => !v)}
              style={{
                border: 'none',
                background: 'transparent',
                color: mutedText,
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {showLatestPayloadCard ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {showLatestPayloadCard && (
          <>
            {lastSavePayload ? (
              <pre
                style={{
                  margin: 0,
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: '#090D16',
                  color: '#E2E8F0',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  fontSize: 10.5,
                  lineHeight: 1.45,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  overflowX: 'auto',
                  maxHeight: 185,
                }}
              >
                {JSON.stringify(lastSavePayload, null, 2)}
              </pre>
            ) : (
              <div style={{ fontSize: 11, color: mutedText, lineHeight: 1.4 }}>
                {isTR
                  ? '💡 Tabloda bir hücre düzenleyip, satır ekleyip veya silip "Toplu Kaydet" butonuna bastığınızda backend API’ye gönderilen tam JSON payload burada görüntülenecektir.'
                  : '💡 Edit a cell, insert or delete rows and click "Batch Save" to inspect the exact JSON payload sent to the backend API.'}
              </div>
            )}
          </>
        )}
      </div>

      {/* Stress Test Action Bar */}
      <div
        style={{
          padding: '9px 12px',
          borderRadius: 10,
          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.06)',
          border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 750, color: isDark ? '#E2E8F0' : '#0F172A' }}>
            🚀 {isTR ? 'Performans Stres Testi' : 'Performance Stress Benchmark'}
          </div>
          <div style={{ fontSize: 10.5, color: mutedText }}>
            {isTR ? '100.000 satır yükleyip yüksek veri performansını test edin' : 'Load 100,000 rows & test large dataset performance'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRunStressTest(100000)}
          style={{
            padding: '5px 10px',
            borderRadius: 7,
            border: 'none',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            fontWeight: 750,
            fontSize: 11,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {isTR ? '100K Stres Testi' : 'Run 100K Test'}
        </button>
      </div>

      {/* Event Console Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 4,
          borderTop: `1px solid ${borderCol}`,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 12 }}>
            ⚡ {isTR ? 'Canlı Olay & Payload Konsolu' : 'Live Event & Payload Console'} ({eventLogs.length})
          </div>
          <div style={{ fontSize: 10.5, color: mutedText }}>
            {isTR
              ? 'Save ve hücre olaylarının JSON verilerini inceleyin'
              : 'Inspect JSON payloads for save & cell events'}
          </div>
        </div>
        <button
          type="button"
          onClick={onClearLogs}
          style={{
            padding: '3px 8px',
            fontSize: 11,
            borderRadius: 5,
            border: `1px solid ${borderCol}`,
            backgroundColor: 'transparent',
            color: isDark ? '#CBD5E1' : '#475569',
            cursor: 'pointer',
          }}
        >
          {isTR ? 'Temizle' : 'Clear'}
        </button>
      </div>

      {/* Event Logs Stream */}
      <div
        style={{
          flex: 1,
          minHeight: 160,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontFamily: 'monospace',
          fontSize: 11,
          paddingRight: 2,
        }}
      >
        {eventLogs.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: mutedText, fontSize: 11.5 }}>
            {isTR ? 'Henüz kayıtlı olay yok.' : 'No events logged yet.'}
          </div>
        ) : (
          eventLogs.map((log) => {
            const color =
              log.status === 'success'
                ? '#10B981'
                : log.status === 'warning'
                ? '#F59E0B'
                : log.status === 'async'
                ? '#38BDF8'
                : '#94A3B8';
            const isSaveEvent =
              log.eventName.includes('onSaving') || log.eventName.includes('onSaved');
            const isExpanded = expandedLogIds[log.id] ?? isSaveEvent;

            return (
              <div
                key={log.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: 7,
                  backgroundColor: cardBg,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 3,
                    fontWeight: 700,
                    color,
                  }}
                >
                  <span>{log.eventName}</span>
                  <span style={{ opacity: 0.7, fontSize: 10 }}>{log.timestamp}</span>
                </div>
                <div style={{ color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.35 }}>
                  {log.summary}
                </div>

                {log.payload !== undefined && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLogIds((prev) => ({ ...prev, [log.id]: !isExpanded }))
                        }
                        style={{
                          padding: '2px 7px',
                          borderRadius: 4,
                          border: `1px solid ${borderCol}`,
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          color: '#A855F7',
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {isExpanded
                          ? isTR
                            ? '▼ JSON Payload Gizle'
                            : '▼ Hide JSON Payload'
                          : isTR
                          ? '▶ { } JSON Payload Göster'
                          : '▶ { } View JSON Payload'}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyJson(log.id, log.payload)}
                        style={{
                          padding: '2px 7px',
                          borderRadius: 4,
                          border: `1px solid ${borderCol}`,
                          backgroundColor: 'transparent',
                          color: mutedText,
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedId === log.id
                          ? isTR
                            ? '✓ Kopyalandı'
                            : '✓ Copied'
                          : isTR
                          ? 'Kopyala'
                          : 'Copy'}
                      </button>
                    </div>
                    {isExpanded && (
                      <pre
                        style={{
                          marginTop: 6,
                          marginBottom: 0,
                          padding: 8,
                          borderRadius: 6,
                          backgroundColor: '#090D16',
                          color: '#E2E8F0',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          fontSize: 10,
                          lineHeight: 1.4,
                          overflowX: 'auto',
                          maxHeight: 170,
                        }}
                      >
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
