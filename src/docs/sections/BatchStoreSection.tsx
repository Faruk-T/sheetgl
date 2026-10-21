import React from 'react';
import { DocThemeColors } from '../types';
import { ALL_COLUMNS_DEMO_DATA, DOC_STATUS_OPTIONS } from '../data/docOptionsAndRows';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { CodeBlock } from '../components/CodeBlock';

export interface BatchStoreSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const BatchStoreSection: React.FC<BatchStoreSectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  return (
    <div>
      <div id="batch-live">
        <LiveDemoBox
          title={
            isTR
              ? 'Canlı Batch Save & CRUD Araç Çubuğu Örneği'
              : 'Live Batch Save & CRUD Toolbar Playground'
          }
          subtitle={
            isTR
              ? "Herhangi bir hücreyi değiştirin veya '+ Satır Ekle' butonuna basın: üst araç çubuğunda Kaydet ve İptal (Vazgeç) butonları belirecektir."
              : "Edit any cell or click '+ Add Row' in the toolbar: the green Batch Save and Discard buttons will appear automatically."
          }
          hints={
            isTR
              ? [
                  'Birkaç hücreyi düzenleyip yeşil vurguyu görün, ardından üstteki "Toplu Kaydet" veya "Vazgeç" butonuna tıklayın',
                ]
              : [
                  'Modify a few cells to see the green dirty highlight, then click "Batch Save" or "Discard" in the toolbar',
                ]
          }
          height={295}
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          showToolbar={true}
          data={ALL_COLUMNS_DEMO_DATA}
          columns={[
            { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
            { id: 'code', title: isTR ? 'Hesap Kodu' : 'Account Code', type: 'text', width: 140 },
            { id: 'company', title: isTR ? 'Şirket Adı' : 'Company Name', type: 'text', width: 200 },
            { id: 'balance', title: isTR ? 'Bakiye ($)' : 'Balance ($)', type: 'currency', width: 160, currencySymbol: '$' },
            { id: 'status', title: isTR ? 'Durum' : 'Status', type: 'select', width: 145, options: DOC_STATUS_OPTIONS },
          ]}
        />
      </div>

      <div id="batch-code">
        <CodeBlock
          id="batch-code-block"
          title="Batch Edit Mode & Backend Transaction Commit"
          langBadge="TSX"
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          code={`<SheetGL
  dataSource={rows}
  columns={columns}
  batchEditMode={true}
  onSaving={async (e) => {
    // e.changes => { inserted: [...], updated: [...], deleted: [...] }
    const response = await fetch('/api/accounts/batch-commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(e.changes),
    });
    if (!response.ok) {
      e.cancel = true; // Keeps dirty cells highlighted if backend transaction fails
    }
  }}
/>`}
        />
      </div>
    </div>
  );
};
