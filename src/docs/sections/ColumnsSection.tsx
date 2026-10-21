import React, { useState, useMemo } from 'react';
import { ColumnCategory, DocThemeColors } from '../types';
import { COLUMN_GUIDES } from '../data/columnGuides';
import { ALL_COLUMNS_DEMO_DATA } from '../data/docOptionsAndRows';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { ColumnGuideCard } from '../components/ColumnGuideCard';

export interface ColumnsSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
  colCategoryFilter: ColumnCategory;
  onCategoryFilterChange: (cat: ColumnCategory) => void;
}

export const ColumnsSection: React.FC<ColumnsSectionProps> = ({
  isDark,
  isTR,
  colors,
  colCategoryFilter,
  onCategoryFilterChange,
}) => {
  const [colSearch, setColSearch] = useState<string>('');

  const filteredColumnGuides = useMemo(() => {
    return COLUMN_GUIDES.filter((item) => {
      if (colCategoryFilter !== 'all' && item.category !== colCategoryFilter) return false;
      if (!colSearch.trim()) return true;
      const q = colSearch.toLowerCase();
      return (
        item.type.toLowerCase().includes(q) ||
        item.titleTr.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.summaryTr.toLowerCase().includes(q) ||
        item.summaryEn.toLowerCase().includes(q)
      );
    });
  }, [colCategoryFilter, colSearch]);

  return (
    <div>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: colors.muted, marginTop: 0 }}>
        {isTR
          ? 'SheetGL Pro, kurumsal uygulamalar için kutudan çıktığı anda hazır 21 yerleşik sütun türü (ColumnType) sunar. Aşağıda hem tüm sütunların bir arada bulunduğu genel tabloyu hem de her bir sütun türünün kendi özel canlı demosunu ve yapılandırma kodunu inceleyebilirsiniz.'
          : 'SheetGL Pro ships with 21 built-in enterprise column types out of the box. Below you can explore the combined interactive playground as well as a dedicated live demo and configuration code for every single column type.'}
      </p>

      {/* Interactive Category Tabs + Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: 14,
          borderRadius: 12,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          margin: '20px 0 24px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(
            [
              { id: 'all', labelTr: 'Tümü (21)', labelEn: 'All Types (21)' },
              { id: 'text', labelTr: 'Metin & İletişim (5)', labelEn: 'Text & Contact (5)' },
              { id: 'numeric', labelTr: 'Sayısal & Finansal (4)', labelEn: 'Numeric & Financial (4)' },
              { id: 'choice', labelTr: 'Seçim & Lookup (5)', labelEn: 'Choice & Lookup (5)' },
              { id: 'structured', labelTr: 'Object & Tarih/Saat (4)', labelEn: 'Object & Date/Time (4)' },
              { id: 'visual', labelTr: 'Görsel & Aksiyon (3)', labelEn: 'Visual & Action (3)' },
            ] as const
          ).map((tab) => {
            const active = colCategoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onCategoryFilterChange(tab.id)}
                style={{
                  padding: '7px 13px',
                  borderRadius: 8,
                  border: `1px solid ${active ? colors.accent : colors.border}`,
                  backgroundColor: active ? colors.accentBg : 'transparent',
                  color: active ? colors.accent : colors.text,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {isTR ? tab.labelTr : tab.labelEn}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={colSearch}
          onChange={(e) => setColSearch(e.target.value)}
          placeholder={
            isTR
              ? 'Sütun türü ara (ör. object, lookup, currency)...'
              : 'Filter column types (e.g. object, lookup, currency)...'
          }
          style={{
            minWidth: 260,
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.bg,
            color: colors.text,
            fontSize: 13.5,
            outline: 'none',
          }}
        />
      </div>

      {/* Live Master Interactive Showcase of All 21 Column Types */}
      <div id="col-playground">
        <LiveDemoBox
          title={
            isTR
              ? `Tüm Sütun Türleri Bir Arada (${filteredColumnGuides.length} Sütun Aktif)`
              : `All Column Types Combined Playground (${filteredColumnGuides.length} Active Columns)`
          }
          subtitle={
            isTR
              ? 'Sağa doğru kaydırarak 21 sütun türünün tamamını tek tabloda görebilir, hücrelere çift tıklayarak düzenleyebilirsiniz.'
              : 'Scroll horizontally to inspect all 21 column types in a single table and double-click any cell to test its inline editor.'
          }
          hints={
            isTR
              ? [
                  'Metadata (Object) hücresine çift tıklayıp Key-Value / JSON düzenleyiciyi açın',
                  'Manager (Lookup) veya City (Dropdown) hücresinde arama yapın',
                  '7-Day Trend (Sparkline) hücresindeki büyüteç ikonuna tıklayın',
                ]
              : [
                  'Double-click Metadata (Object) to open the Visual Key-Value / JSON editor',
                  'Click Manager (Lookup) or City (Dropdown) to search options',
                  'Click the expand icon on 7-Day Trend (Sparkline) to open the chart modal',
                ]
          }
          height={235}
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          showToolbar={true}
          showFormulaBar={false}
          showSummaryFooter={false}
          data={ALL_COLUMNS_DEMO_DATA}
          columns={[
            { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 60, pinned: 'left', readonly: true },
            ...filteredColumnGuides.map((g) => g.sampleColumnDef),
          ]}
        />
      </div>

      {/* Detailed Guide Card + Dedicated Live Demo for Each of the 21 Column Types */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {filteredColumnGuides.map((col, idx) => (
          <ColumnGuideCard
            key={col.type}
            col={col}
            idx={idx}
            isDark={isDark}
            isTR={isTR}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
};
