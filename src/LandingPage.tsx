import React from 'react';
import { SheetGL, ColumnDef } from './datagrid';
import { SheetGLLogo } from './datagrid';

export interface LandingPageProps {
  isDark: boolean;
  lang: 'tr' | 'en';
  demoData: any[];
  demoColumns: ColumnDef[];
  onOpenStudio: () => void;
  onOpenDocs: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isDark,
  lang,
  demoData,
  demoColumns,
  onOpenStudio,
  onOpenDocs,
  onToggleTheme,
  onToggleLang,
}) => {
  const isTR = lang === 'tr';

  const colors = {
    bg: isDark ? '#06070B' : '#FAF9FE',
    navBg: isDark ? 'rgba(6, 7, 11, 0.78)' : 'rgba(250, 249, 254, 0.85)',
    card: isDark ? 'rgba(18, 14, 33, 0.72)' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(134, 59, 255, 0.22)' : 'rgba(134, 59, 255, 0.14)',
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
    text: isDark ? '#F9FAFB' : '#0B081B',
    muted: isDark ? '#9CA3AF' : '#5E6478',
    ctaGradient: 'linear-gradient(135deg, #1E40AF 0%, #0284C7 50%, #0D9488 100%)',
    ctaHover: 'linear-gradient(135deg, #2563EB 0%, #0369A1 100%)',
    purpleAccent: '#863BFF',
    cyanAccent: '#38BDF8',
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
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
          title: 'Yaşam Döngüsü Olayları & Backend Senkronizasyonu',
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
          title: 'Lifecycle Triggers & Backend Cascade',
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

  const faqs = isTR
    ? [
        {
          q: 'SheetGL, DevExtreme DataGrid veya ag-Grid lisansı gerektirir mi?',
          a: 'Hayır! SheetGL sıfırdan MIT lisanslı ve açık mimariyle geliştirilmiş, tamamen özgür ve bağımsız bir HTML5 Canvas & WebGL motorudur.',
        },
        {
          q: '100.000 satırda tarayıcı donar mı?',
          a: 'Kesinlikle hayır. Yalnızca ekranda görünen hücreler (viewport) çizilir. DOM üzerinde binlerce düğüm oluşmadığı için 60 FPS sabit hızda çalışır.',
        },
        {
          q: 'Excel kısayolları ve formül barı destekleniyor mu?',
          a: 'Evet; Ctrl+C / Ctrl+V (TSV kopyalama/yapıştırma), Ctrl+D, Ctrl+R, F2 inline edit, yön tuşlarıyla gezinti ve Formül Barı tam entegredir.',
        },
      ]
    : [
        {
          q: 'Does SheetGL require a commercial DevExtreme or ag-Grid license?',
          a: 'No! SheetGL is built from scratch under the MIT license with open architecture. Completely independent and royalty-free.',
        },
        {
          q: 'Does it freeze with 100,000 rows in the browser?',
          a: 'Never. Only visible viewport cells are painted on HTML5 Canvas. Zero DOM node pollution ensures consistent 60 FPS performance.',
        },
        {
          q: 'Are native Excel shortcuts and formula bars supported?',
          a: 'Yes; Ctrl+C / Ctrl+V (native TSV clipboard), Ctrl+D, Ctrl+R, F2 cell edit, arrow navigation, and real-time formula bar are built-in.',
        },
      ];

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: colors.bg,
        backgroundImage: isDark
          ? `radial-gradient(ellipse 90% 55% at 50% -8%, rgba(14, 165, 233, 0.16) 0%, rgba(134, 59, 255, 0.22) 35%, rgba(6, 7, 11, 0) 80%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`
          : `radial-gradient(ellipse 85% 50% at 50% -5%, rgba(14, 165, 233, 0.1) 0%, rgba(134, 59, 255, 0.12) 35%, rgba(250, 249, 254, 0) 85%), linear-gradient(rgba(134, 59, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(134, 59, 255, 0.025) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        color: colors.text,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* PARABOL-STYLE HEADER (Sticky & Glassmorphism) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 500,
          width: '100%',
          backgroundColor: colors.navBg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${colors.border}`,
          userSelect: 'none',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* LEFT: BRAND LOGO (Parabol Style) */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <SheetGLLogo size={30} glow={true} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: '-0.035em',
                  color: colors.text,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
                }}
              >
                sheetgl
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#38BDF8',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                PRO
              </span>
            </div>
          </div>

          {/* CENTER: NAV LINKS */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
            }}
          >
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#D1D5DB' : '#374151',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#D1D5DB' : '#374151')}
            >
              {isTR ? 'Özellikler' : 'Features'}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('preview')}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#D1D5DB' : '#374151',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#D1D5DB' : '#374151')}
            >
              Demo
            </button>

            <button
              type="button"
              onClick={onOpenDocs}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#D1D5DB' : '#374151',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#D1D5DB' : '#374151')}
            >
              {isTR ? 'Dokümantasyon' : 'Docs'}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#D1D5DB' : '#374151',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#D1D5DB' : '#374151')}
            >
              {isTR ? 'SSS' : 'FAQ'}
            </button>
          </nav>

          {/* RIGHT: THEME TOGGLE, LANG TOGGLE, CTA BUTTON (Parabol Style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Language Switcher */}
            <button
              type="button"
              onClick={onToggleLang}
              title={isTR ? 'Dili İngilizceye çevir' : 'Switch to Turkish'}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                color: colors.text,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {lang.toUpperCase()}
            </button>

            {/* Sun/Moon Theme Toggle (Parabol Style) */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={isTR ? 'Temayı Değiştir' : 'Toggle Theme'}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                backgroundColor: isDark ? '#0D111A' : '#F1F5F9',
                color: isDark ? '#FBBF24' : '#6B21A8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Primary Action Button: "Uygulamaya Git →" (Parabol Exact Style) */}
            <button
              type="button"
              onClick={onOpenStudio}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 999,
                border: 'none',
                background: 'linear-gradient(135deg, #1D4ED8 0%, #0284C7 60%, #06B6D4 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                boxShadow: isDark
                  ? '0 4px 18px rgba(2, 132, 199, 0.45)'
                  : '0 4px 14px rgba(2, 132, 199, 0.3)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>{isTR ? 'Uygulamaya Git' : 'Launch Studio'}</span>
              <span style={{ fontSize: 15 }}>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          maxWidth: 1260,
          margin: '0 auto',
          padding: '48px 24px 32px',
          textAlign: 'center',
          position: 'relative',
        }}
      >

        {/* HERO TITLE (Large & Bold Parabol Typography) */}
        <h1
          className={isDark ? 'hero-title-dark' : 'hero-title-light'}
          style={{
            fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: '0 auto 20px',
            maxWidth: 1040,
            letterSpacing: '-0.035em',
          }}
        >
          {isTR ? (
            <>
              React İçin Yeni Nesil{' '}
              <span className={isDark ? 'hero-gradient-span-dark' : 'hero-gradient-span-light'}>
                Ultra Hızlı Excel
              </span>{' '}
              DataGrid
            </>
          ) : (
            <>
              The Ultra-Fast{' '}
              <span className={isDark ? 'hero-gradient-span-dark' : 'hero-gradient-span-light'}>
                Excel-Grade DataGrid
              </span>{' '}
              for React
            </>
          )}
        </h1>

        {/* HERO SUBTITLE */}
        <p
          style={{
            fontSize: 17.5,
            color: colors.muted,
            maxWidth: 820,
            margin: '0 auto 34px',
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          {isTR
            ? '100.000+ satırda takılmayan 60 FPS Canvas performansı. Akıllı hücre çoğaltma, Excel kısayolları ve kurumsal veri yönetimi tek bir bileşende.'
            : 'Silky-smooth 60 FPS Canvas performance across 100,000+ rows. Smart fill handles, Excel shortcuts, and enterprise-grade data management in a single component.'}
        </p>

        {/* CTA ACTIONS (Parabol Style) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
          <button
            type="button"
            onClick={onOpenStudio}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 26px',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, #1D4ED8 0%, #0284C7 60%, #06B6D4 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14.5,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
              transition: 'transform 0.18s ease',
            }}
          >
            <span>{isTR ? 'Stüdyoyu Başlat' : 'Launch Studio'}</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={onOpenDocs}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 22px',
              borderRadius: 999,
              border: `1px solid ${colors.border}`,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
              color: colors.text,
              fontWeight: 700,
              fontSize: 14.5,
              cursor: 'pointer',
              transition: 'background-color 0.18s ease',
            }}
          >
            <span>{isTR ? 'Dokümantasyon' : 'Documentation'}</span>
          </button>
        </div>

        {/* LIVE INTERACTIVE CANVAS PREVIEW BADGE */}
        <div
          id="preview"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1220,
            margin: '0 auto 12px',
            padding: '0 4px',
            fontSize: 12,
            color: colors.muted,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            <span style={{ color: colors.text }}>
              {isTR ? 'Canlı İnteraktif Önizleme (Aşağıdaki Tabloyu Deneyin)' : 'Live Interactive Preview (Try the Grid Below)'}
            </span>
          </div>
          <span style={{ fontSize: 11.5 }}>
            {isTR ? 'Fill Handle • Satır Ekle/Sil • Çoklu Seçim' : 'Fill Handle • Add/Delete • Multi Select'}
          </span>
        </div>

        {/* LIVE INTERACTIVE EMBEDDED PREVIEW CONTAINER */}
        <div
          style={{
            height: 540,
            borderRadius: 16,
            overflow: 'hidden',
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: isDark
              ? '0 28px 70px rgba(0, 0, 0, 0.75), 0 0 35px rgba(134, 59, 255, 0.15)'
              : '0 24px 60px rgba(134, 59, 255, 0.15), 0 10px 24px rgba(15, 23, 42, 0.08)',
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
      <section id="features" style={{ maxWidth: 1260, margin: '0 auto', padding: '48px 24px 72px' }}>
        <h2
          style={{
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 36,
            letterSpacing: '-0.02em',
          }}
        >
          {isTR ? 'Kurumsal Mimari ve Öne Çıkan Yetenekler' : 'Enterprise Architecture & Capabilities'}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                padding: 24,
                borderRadius: 14,
                backgroundColor: colors.card,
                border: `1px solid ${colors.cardBorder}`,
                backdropFilter: 'blur(10px)',
                boxShadow: isDark
                  ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                  : '0 4px 16px rgba(134, 59, 255, 0.06)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 14,
                  backgroundColor: isDark ? 'rgba(134, 59, 255, 0.16)' : 'rgba(134, 59, 255, 0.1)',
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 16.5, marginBottom: 8, color: colors.text }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13.5, color: colors.muted, lineHeight: 1.65 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION (Parabol style) */}
      <section id="faq" style={{ maxWidth: 880, margin: '0 auto', padding: '16px 24px 72px' }}>
        <h2
          style={{
            textAlign: 'center',
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 32,
            letterSpacing: '-0.02em',
          }}
        >
          {isTR ? 'Sıkça Sorulan Sorular' : 'Frequently Asked Questions'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                padding: '20px 24px',
                borderRadius: 14,
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 8, color: colors.text }}>
                {faq.q}
              </div>
              <div style={{ fontSize: 14, color: colors.muted, lineHeight: 1.6 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '32px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: colors.muted,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <SheetGLLogo size={18} />
          <span style={{ fontWeight: 800, color: colors.text }}>sheetgl</span>
          <span>•</span>
          <span>Next-Gen WebGL & Canvas DataGrid for React</span>
        </div>
        <nav
          aria-label="Footer Links"
          style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 10, fontSize: 12.5 }}
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ color: colors.muted, textDecoration: 'none' }}
          >
            {isTR ? 'Ana Sayfa (/)' : 'Home (/)'}
          </a>
          <a
            href="/documentation"
            onClick={(e) => {
              e.preventDefault();
              onOpenDocs();
            }}
            style={{ color: colors.muted, textDecoration: 'none' }}
          >
            {isTR ? 'Dokümantasyon (/documentation)' : 'Documentation (/documentation)'}
          </a>
          <a
            href="/demo"
            onClick={(e) => {
              e.preventDefault();
              onOpenStudio();
            }}
            style={{ color: colors.muted, textDecoration: 'none' }}
          >
            {isTR ? 'Canlı Demo (/demo)' : 'Live Demo (/demo)'}
          </a>
          <a href="/llms.txt" target="_blank" rel="noreferrer" style={{ color: colors.muted, textDecoration: 'none' }}>
            LLMs.txt (GEO)
          </a>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" style={{ color: colors.muted, textDecoration: 'none' }}>
            Sitemap
          </a>
        </nav>
        <div>MIT License • © 2026 SheetGL Team</div>
      </footer>
    </div>
  );
};
