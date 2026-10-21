import React from 'react';
import { DocThemeColors } from '../types';
import {
  ALL_COLUMNS_DEMO_DATA,
  DOC_CITY_OPTIONS,
  DOC_STATUS_OPTIONS,
} from '../data/docOptionsAndRows';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { CodeBlock } from '../components/CodeBlock';

export interface FilteringGroupingSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const FilteringGroupingSection: React.FC<FilteringGroupingSectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  return (
    <div>
      <div id="flt-live">
        <LiveDemoBox
          title={
            isTR
              ? 'Canlı Gruplama, Başlık Filtresi ve Özet Satırı Örneği'
              : 'Live Grouping, Header Filter & Summary Footer Example'
          }
          subtitle={
            isTR
              ? 'Sütun başlıklarındaki filtre (huni) ikonuna tıklayarak Değer veya Koşul filtresi uygulayın; üstteki grup çubuğundan gruplamayı yönetin.'
              : 'Click the funnel icon on any column header to filter by formatted values or conditions; click group rows to expand/collapse.'
          }
          hints={
            isTR
              ? [
                  'Bakiye ($) sütun başlığındaki filtre ikonuna tıklayıp "Koşul Filtresi -> Büyük (>)" deneyin',
                  'Grup satırlarına tıklayarak grupları daraltıp genişletin',
                ]
              : [
                  'Click the filter funnel icon on Gross Balance ($) and test Condition Filter -> Greater than (>)',
                  'Click group header rows to collapse or expand grouped records',
                ]
          }
          height={290}
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          data={ALL_COLUMNS_DEMO_DATA}
          showGroupPanel={true}
          showSummaryFooter={true}
          initialGroups={[{ selector: 'city' }]}
          columns={[
            { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
            { id: 'company', title: isTR ? 'Şirket' : 'Company', type: 'text', width: 190 },
            { id: 'city', title: isTR ? 'Şehir' : 'City', type: 'dropdown', width: 165, groupable: true, options: DOC_CITY_OPTIONS },
            { id: 'status', title: isTR ? 'Durum' : 'Status', type: 'select', width: 145, groupable: true, options: DOC_STATUS_OPTIONS },
            { id: 'balance', title: isTR ? 'Brüt Bakiye ($)' : 'Gross Balance ($)', type: 'currency', width: 165, currencySymbol: '$', summaryType: 'sum' },
            { id: 'progress', title: isTR ? 'Kota (%)' : 'Quota (%)', type: 'progress', width: 140, summaryType: 'avg' },
          ]}
        />
      </div>

      <div id="flt-code">
        <CodeBlock
          id="filter-group-code"
          title={
            isTR
              ? 'Gruplama ve Alt Özet Satırı (Summary Footer)'
              : 'Multi-Column Grouping & Sticky Summary Footer'
          }
          langBadge="TSX"
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          code={`<SheetGL
  dataSource={rows}
  columns={[
    { id: 'company', title: '${isTR ? 'Şirket' : 'Company'}', type: 'text', width: 190 },
    { id: 'city', title: '${isTR ? 'Şehir' : 'City'}', type: 'dropdown', width: 165, groupable: true, filterable: true },
    { id: 'balance', title: '${isTR ? 'Brüt Bakiye ($)' : 'Gross Balance ($)'}', type: 'currency', width: 165, summaryType: 'sum' },
    { id: 'progress', title: '${isTR ? 'Kota (%)' : 'Quota (%)'}', type: 'progress', width: 140, summaryType: 'avg' },
  ]}
  initialGroups={[{ selector: 'city' }]}
  summaryRow={{
    visible: true,
    showTotalCount: true,
    showSelectionStats: true,
    showColumnSummaries: true,
  }}
/>`}
        />
      </div>
    </div>
  );
};
