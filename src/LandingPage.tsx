import React from 'react';
import { SheetGL, ColumnDef } from './datagrid';

export interface LandingPageProps {
  isDark: boolean;
  lang: 'tr' | 'en';
  demoData: any[];
  demoColumns: ColumnDef[];
  onOpenStudio: () => void;
  onOpenDocs: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isDark,
  lang,
  demoData,
  demoColumns,
  onOpenStudio,
  onOpenDocs,
}) => {
  const isTR = lang === 'tr';

  const colors = {
    bg: isDark ? '#080C14' : '#F8FAFC',
    card: isDark ? '#111827' : '#FFFFFF',
    cardAlt: isDark ? '#1E293B' : '#F1F5F9',
    border: isDark ? '#1F2937' : '#E2E8F0',
    text: isDark ? '#F9FAFB' : '#0F172A',
    muted: isDark ? '#9CA3AF' : '#64748B',
    accent: isDark ? '#38BDF8' : '#0284C7',
    accentGradient: isDark
      ? 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)'
      : 'linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)',
  };

  const features = isTR
    ? [
        {
          icon: '⚡',
          title: '60 FPS HTML5 Canvas Motoru',
          desc: '10.000+ satır ve onlarca sütunu sıfır DOM şişkinliği ile akıcı 60 FPS hızında çizer. Sağ yan kaydırma göstergesi ve otomatik kenar kaydırma (edge auto-scroll) içerir.',
        },
        {
          icon: '📐',
          title: 'Tam Microsoft Excel Deneyimi',
          desc: 'Sağ alt Fill Handle sürükleme, hücre sağ yanı (+) çoğaltma butonu, Ctrl+D / Ctrl+R, sağ tık menüsü ile satır çoğaltma ve Excel TSV Kopyala/Yapıştır.',
        },
        {
          icon: '🔄',
          title: 'DevExtreme Event Trigger & Backend Cascade',
          desc: 'Bir sütun güncellendiğinde (ör. Şehir, Sektör veya Bakiye) ilişkili diğer sütunları doğrudan backend API’den çekerek satırı canlı senkronize eder.',
        },
        {
          icon: '🔒',
          title: '3 Katmanlı Yetkilendirme (Permissions)',
          desc: 'Tablo, sütun ve satır bazlı write / readonly / read izinleri, koşullu düzenleme (canEdit) ve veri doğrulama (validator) kuralları.',
        },
        {
          icon: '💾',
          title: 'Batch Save & Kirli Hücre Takibi',
          desc: 'Eklenen, düzenlenen ve silinen kayıtları yeşil köşe işaretçileriyle izler; tek tıkla Toplu Kayıt (Batch Save), Geri Alma (Discard) ve 100 adımlı Undo/Redo sunar.',
        },
        {
          icon: '🧮',
          title: 'Dinamik Özetler & Çift Modlu Filtreler',
          desc: 'Alt özet satırında ve grup başlıklarında çalışma zamanında SUM, AVG, MIN, MAX, COUNT seçimi; Değer Listesi ve Koşul Kuralı destekli Excel filtreleri.',
        },
      ]
    : [
        {
          icon: '⚡',
          title: '60 FPS HTML5 Canvas Engine',
          desc: 'Renders 10,000+ rows with zero DOM bloat at 60 FPS. Includes right-side live scroll row indicator, quick jump buttons, and edge auto-scrolling.',
        },
        {
          icon: '📐',
          title: 'Complete Microsoft Excel UX',
          desc: 'Bottom-right Fill Handle drag, right-side (+) cell duplicate button, Ctrl+D / Ctrl+R, right-click row duplication, and native Excel TSV Copy/Paste.',
        },
        {
          icon: '🔄',
          title: 'DevExtreme Triggers & Backend Cascade',
          desc: 'When a cell changes (e.g. City, Sector, or Balance), automatically fetches dependent fields from the backend and updates the row in real time.',
        },
        {
          icon: '🔒',
          title: '3-Tier Permissions (Write / ReadOnly)',
          desc: 'Grid-level, column-level, and conditional row-level permissions (canEdit) plus inline validation rules enforced across all edit surfaces.',
        },
        {
          icon: '💾',
          title: 'Batch Save & Dirty State Tracking',
          desc: 'Tracks inserted, modified, and deleted rows with visual Canvas corner markers, atomic Batch Save, Discard, and 100-step Undo/Redo.',
        },
        {
          icon: '🧮',
          title: 'Dynamic Summaries & Dual Filters',
          desc: 'Switch any column summary between SUM, AVG, MIN, MAX, COUNT at runtime, plus live multi-cell selection stats and Excel Value/Condition filters.',
        },
      ];

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {/* HERO SECTION */}
      <section
        style={{
          maxWidth: 1260,
          margin: '0 auto',
          padding: '48px 24px 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 999,
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.1)',
            color: colors.accent,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          <span>✨ SHEETGL PRO v2.0 ENTERPRISE</span>
          <span>•</span>
          <span>{isTR ? 'EXCEL UX + DEVEXTREME GÜCÜ' : 'EXCEL UX + DEVEXTREME POWER'}</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 4.2vw, 50px)',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: '0 auto 16px',
            maxWidth: 920,
            letterSpacing: '-0.02em',
          }}
        >
          {isTR
            ? 'React İçin 60 FPS Excel Deneyimi ve DevExtreme Kurumsal Veri Tablosu'
            : 'The 60 FPS Excel Experience & DevExtreme Enterprise DataGrid for React'}
        </h1>

        <p
          style={{
            fontSize: 16,
            color: colors.muted,
            maxWidth: 760,
            margin: '0 auto 28px',
            lineHeight: 1.65,
          }}
        >
          {isTR
            ? 'Hücre ve satır çoğaltma (Fill Handle & Sağ Tık), rol bazlı yetkilendirme (Write / ReadOnly), toplu kayıt (Batch CRUD), dinamik alt özetler ve bir sütun güncellendiğinde diğer sütunların doğrudan backend’den çekilip güncellenmesini sağlayan olay tetikleyicileri.'
            : 'Cell & row duplication (Fill Handle & Right-Click), role-based permissions (Write / ReadOnly), Batch CRUD, dynamic summaries, and DevExtreme event triggers with automatic cascading backend updates.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
          <button
            type="button"
            onClick={onOpenStudio}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              background: colors.accentGradient,
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
            }}
          >
            🚀 {isTR ? 'Tam Ekran Excel Stüdyosunu Başlat' : 'Launch Full-Screen Excel Studio'}
          </button>
          <button
            type="button"
            onClick={onOpenDocs}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.card,
              color: colors.text,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            📚 {isTR ? 'Dokümantasyonu İncele' : 'Explore Documentation'}
          </button>
        </div>

        {/* LIVE INTERACTIVE EMBEDDED PREVIEW */}
        <div
          style={{
            height: 520,
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${colors.border}`,
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.65)'
              : '0 20px 50px rgba(15, 23, 42, 0.12)',
            textAlign: 'left',
          }}
        >
          <SheetGL
            dataSource={demoData}
            columns={demoColumns}
            theme={isDark ? 'apple-dark' : 'apple-light'}
            locale={lang}
            batchEditMode={true}
          />
        </div>
      </section>

      {/* FEATURE PILLARS GRID */}
      <section style={{ maxWidth: 1260, margin: '0 auto', padding: '32px 24px 64px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, marginBottom: 28 }}>
          {isTR ? 'Kurumsal Mimari ve Öne Çıkan Özellikler' : 'Enterprise Capabilities & Highlights'}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 18,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                padding: 22,
                borderRadius: 12,
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: colors.muted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
