import React, { useState, useMemo, useEffect } from 'react';
import { ColumnCategory, DocsPortalProps, DocSubItem, getDocThemeColors } from './docs/types';
import { buildDocSections } from './docs/sectionRegistry';
import { DocsHeader } from './docs/components/DocsHeader';
import { DocsSidebar } from './docs/components/DocsSidebar';

export type { DocsPortalProps } from './docs/types';

export const DocsPortal: React.FC<DocsPortalProps> = ({
  isDark,
  lang,
  initialSection,
  initialSectionId,
  onSectionChange,
  onToggleTheme,
  onToggleLang,
  onNavigateStudio,
  onNavigateLanding,
  onOpenStudio,
  onOpenLanding,
}) => {
  const isTR = lang === 'tr';
  const resolvedInitialSection = initialSectionId || initialSection || 'quickstart';
  const handleGoStudio = onOpenStudio || onNavigateStudio || (() => {});
  const handleGoLanding = onOpenLanding || onNavigateLanding || (() => {});

  const [activeSectionId, setActiveSectionId] = useState<string>(resolvedInitialSection);
  const [activeSubId, setActiveSubId] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [resolvedInitialSection]: true,
    columns: true,
    validation: true,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [colCategoryFilter, setColCategoryFilter] = useState<ColumnCategory>('all');

  useEffect(() => {
    const nextSec = initialSectionId || initialSection;
    if (nextSec && nextSec !== activeSectionId) {
      setActiveSectionId(nextSec);
      setExpandedSections((prev) => ({ ...prev, [nextSec]: true }));
    }
  }, [initialSection, initialSectionId]);

  const colors = useMemo(() => getDocThemeColors(isDark), [isDark]);

  const sections = useMemo(
    () =>
      buildDocSections({
        isDark,
        isTR,
        colors,
        colCategoryFilter,
        onCategoryFilterChange: setColCategoryFilter,
      }),
    [isDark, isTR, colors, colCategoryFilter]
  );

  const visibleSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.titleTr.toLowerCase().includes(q) ||
        s.titleEn.toLowerCase().includes(q) ||
        s.subtitleTr.toLowerCase().includes(q) ||
        s.subtitleEn.toLowerCase().includes(q) ||
        s.subItems.some(
          (sub) =>
            sub.labelTr.toLowerCase().includes(q) || sub.labelEn.toLowerCase().includes(q)
        )
    );
  }, [sections, searchQuery]);

  const activeSection =
    visibleSections.find((s) => s.id === activeSectionId) ||
    visibleSections[0] ||
    sections[0];

  const currentIdx = sections.findIndex((s) => s.id === activeSection.id);
  const prevSection = currentIdx > 0 ? sections[currentIdx - 1] : null;
  const nextSection = currentIdx < sections.length - 1 ? sections[currentIdx + 1] : null;

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    setActiveSubId('');
    setExpandedSections((prev) => ({ ...prev, [id]: true }));
    onSectionChange?.(id);
    const mainEl = document.getElementById('docs-main-scroll');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleExpandSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectSubItem = (sectionId: string, sub: DocSubItem) => {
    if (activeSectionId !== sectionId) {
      setActiveSectionId(sectionId);
      onSectionChange?.(sectionId);
    }
    setActiveSubId(sub.id);
    setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
    sub.onSelect?.();
    setTimeout(() => {
      const targetEl = document.getElementById(sub.id);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: 'hidden',
      }}
    >
      <DocsHeader
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        onGoLanding={handleGoLanding}
        onGoStudio={handleGoStudio}
        onToggleLang={onToggleLang}
        onToggleTheme={onToggleTheme}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <DocsSidebar
          sections={visibleSections}
          activeSectionId={activeSection.id}
          activeSubId={activeSubId}
          expandedSections={expandedSections}
          searchQuery={searchQuery}
          isTR={isTR}
          colors={colors}
          onSearchChange={setSearchQuery}
          onSelectSection={handleSelectSection}
          onToggleExpandSection={handleToggleExpandSection}
          onSelectSubItem={handleSelectSubItem}
        />

        <main
          id="docs-main-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px 56px 80px',
          }}
        >
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: colors.accentBg,
                  color: colors.accent,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  marginBottom: 10,
                }}
              >
                {isTR ? activeSection.badgeTr : activeSection.badgeEn}
              </span>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  margin: '0 0 10px',
                  letterSpacing: '-0.02em',
                }}
              >
                {isTR ? activeSection.titleTr : activeSection.titleEn}
              </h1>
              <p style={{ fontSize: 17, color: colors.muted, margin: 0, lineHeight: 1.6 }}>
                {isTR ? activeSection.subtitleTr : activeSection.subtitleEn}
              </p>
            </div>

            <div>{activeSection.render()}</div>

            {/* Bottom Prev / Next Step Navigation */}
            <div
              style={{
                marginTop: 48,
                paddingTop: 24,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              {prevSection ? (
                <button
                  type="button"
                  onClick={() => handleSelectSection(prevSection.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    fontSize: 14.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← {isTR ? prevSection.titleTr : prevSection.titleEn}
                </button>
              ) : (
                <div />
              )}

              {nextSection && (
                <button
                  type="button"
                  onClick={() => handleSelectSection(nextSection.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: `1px solid ${colors.accent}`,
                    backgroundColor: colors.accentBg,
                    color: colors.accent,
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isTR ? nextSection.titleTr : nextSection.titleEn} →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
