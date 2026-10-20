import React, { useState, useMemo, useEffect } from 'react';
import { SheetGLLogo } from './datagrid';

export interface DocsPortalProps {
  isDark: boolean;
  lang: 'tr' | 'en';
  initialSectionId?: string;
  onSectionChange?: (sectionId: string) => void;
  onOpenStudio: () => void;
  onOpenLanding?: () => void;
  onToggleTheme?: () => void;
  onToggleLang?: () => void;
}

interface DocSection {
  id: string;
  step: string;
  titleTr: string;
  titleEn: string;
  subtitleTr: string;
  subtitleEn: string;
  contentTr: React.ReactNode;
  contentEn: React.ReactNode;
}

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'default',
  'function',
  'const',
  'let',
  'var',
  'return',
  'async',
  'await',
  'if',
  'else',
  'true',
  'false',
  'null',
  'undefined',
  'new',
  'npm',
  'npx',
  'install',
  'init',
  'create',
]);

const TYPES_AND_COMPONENTS = new Set([
  'SheetGL',
  'ColumnDef',
  'GridPermissions',
  'App',
  'Number',
  'JSON',
  'Promise',
  'fetch',
  'console',
]);

function renderHighlightedLine(line: string, isDark: boolean): React.ReactNode {
  const trimmed = line.trimStart();
  const commentColor = isDark ? '#6A9955' : '#64748B';
  const stringColor = isDark ? '#34D399' : '#059669';
  const keywordColor = isDark ? '#C084FC' : '#7C3AED';
  const typeColor = isDark ? '#38BDF8' : '#0284C7';
  const propColor = isDark ? '#93C5FD' : '#2563EB';
  const numberColor = isDark ? '#FB923C' : '#EA580C';
  const defaultColor = isDark ? '#E2E8F0' : '#1E293B';

  if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
    return <span style={{ color: commentColor, fontStyle: 'italic' }}>{line}</span>;
  }

  // Tokenize strings, comments, identifiers, props, numbers, and punctuation
  const tokenRegex =
    /(\/\/.*$|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|`(?:\\.|[^`])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*(?=\s*:)|\b[A-Za-z_]\w*\b|[{}()[\].,:;=<>/+-]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const token = match[0];
    const afterChar = line[match.index + token.length];

    let color = defaultColor;
    let fontWeight: number | undefined = undefined;
    let fontStyle: string | undefined = undefined;

    if (token.startsWith('//')) {
      color = commentColor;
      fontStyle = 'italic';
    } else if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
      color = stringColor;
    } else if (/^\d/.test(token)) {
      color = numberColor;
    } else if (KEYWORDS.has(token)) {
      color = keywordColor;
      fontWeight = 600;
    } else if (TYPES_AND_COMPONENTS.has(token)) {
      color = typeColor;
      fontWeight = 600;
    } else if (afterChar === ':' || afterChar === '=') {
      color = propColor;
    }

    parts.push(
      <span key={keyIdx++} style={{ color, fontWeight, fontStyle }}>
        {token}
      </span>
    );

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line;
}

export const DocsPortal: React.FC<DocsPortalProps> = ({
  isDark,
  lang,
  initialSectionId = 'quickstart',
  onSectionChange,
  onOpenStudio,
  onOpenLanding,
  onToggleTheme,
  onToggleLang,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(initialSectionId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    if (initialSectionId) {
      setActiveSectionId(initialSectionId);
    }
  }, [initialSectionId]);

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    onSectionChange?.(id);
  };

  const isTR = lang === 'tr';

  const colors = {
    bg: isDark ? '#0B0F17' : '#F8FAFC',
    surface: isDark ? '#111827' : '#FFFFFF',
    surfaceAlt: isDark ? '#1E293B' : '#F1F5F9',
    border: isDark ? '#1F2937' : '#E2E8F0',
    text: isDark ? '#F9FAFB' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#475569',
    accent: isDark ? '#38BDF8' : '#0284C7',
    accentBg: isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.1)',
    codeBg: isDark ? '#090D16' : '#F8FAFC',
    codeHeaderBg: isDark ? '#111827' : '#F1F5F9',
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId((prev) => (prev === id ? null : prev)), 1500);
  };

  const CodeBlock: React.FC<{ id: string; title: string; langBadge?: string; code: string }> = ({
    id,
    title,
    langBadge = 'TSX',
    code,
  }) => {
    const lines = code.split('\n');
    return (
      <div
        style={{
          margin: '18px 0',
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.codeBg,
          boxShadow: isDark ? '0 10px 28px rgba(0,0,0,0.35)' : '0 6px 20px rgba(15,23,42,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: colors.codeHeaderBg,
            borderBottom: `1px solid ${colors.border}`,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: 5,
                backgroundColor: colors.accentBg,
                color: colors.accent,
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {langBadge}
            </span>
            <span style={{ color: colors.text, fontWeight: 600 }}>{title}</span>
          </div>
          <button
            type="button"
            onClick={() => copyCode(id, code)}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: `1px solid ${colors.border}`,
              backgroundColor: copiedCodeId === id ? '#10B981' : colors.surface,
              color: copiedCodeId === id ? '#FFFFFF' : colors.text,
              fontSize: 12.5,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {copiedCodeId === id ? (isTR ? '✓ Kopyalandı' : '✓ Copied') : isTR ? 'Kopyala' : 'Copy'}
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '18px 20px',
            overflowX: 'auto',
            fontSize: 14.5,
            lineHeight: 1.7,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          }}
        >
          <code>
            {lines.map((line, i) => (
              <div key={i} style={{ display: 'table-row' }}>
                <span
                  style={{
                    display: 'table-cell',
                    userSelect: 'none',
                    paddingRight: 18,
                    textAlign: 'right',
                    color: isDark ? '#475569' : '#94A3B8',
                    fontSize: 12.5,
                    minWidth: 24,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ display: 'table-cell', whiteSpace: 'pre' }}>
                  {renderHighlightedLine(line, isDark)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    );
  };

  const SimpleTable: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
    <div
      style={{
        margin: '16px 0',
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
        <thead>
          <tr style={{ backgroundColor: colors.surfaceAlt, textAlign: 'left' }}>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: '13px 16px',
                  borderBottom: `1px solid ${colors.border}`,
                  fontWeight: 700,
                  color: colors.text,
                  fontSize: 14.5,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr
              key={ri}
              style={{
                borderBottom: ri < rows.length - 1 ? `1px solid ${colors.border}` : 'none',
              }}
            >
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: '12px 16px',
                    fontFamily: ci === 0 ? "'JetBrains Mono', monospace" : 'inherit',
                    fontWeight: ci === 0 ? 600 : 400,
                    fontSize: ci === 0 ? 14 : 15,
                    color: ci === 0 ? colors.accent : colors.text,
                    lineHeight: 1.5,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const sections: DocSection[] = useMemo(
    () => [
      {
        id: 'quickstart',
        step: '1',
        titleTr: 'Kurulum & Başlangıç',
        titleEn: 'Quick Start',
        subtitleTr: '2 adımda SheetGL kurulumu ve ilk Excel tablonuzun oluşturulması.',
        subtitleEn: 'Install SheetGL and render your first 60 FPS Excel grid in 2 steps.',
        contentTr: (
          <div>
            <h3 style={{ fontSize: 19, fontWeight: 700, margin: '8px 0 8px' }}>1. Paketi Kurun</h3>
            <CodeBlock
              id="install-tr"
              title="Terminal"
              langBadge="BASH"
              code={`npm install sheetgl\n\n# Veya hazır bileşen şablonunu otomatik oluşturun:\nnpx sheetgl init`}
            />
            <h3 style={{ fontSize: 19, fontWeight: 700, margin: '24px 0 8px' }}>2. Tabloyu Ekleyin</h3>
            <CodeBlock
              id="usage-tr"
              title="App.tsx"
              langBadge="TSX"
              code={`import { SheetGL, ColumnDef } from 'sheetgl';

const columns: ColumnDef[] = [
  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 70, readonly: true },
  { id: 'company', title: 'Şirket', type: 'text', width: 200, pinned: 'left' },
  { id: 'city', title: 'Şehir', type: 'dropdown', width: 150, groupable: true, options: [
    { value: 'Istanbul', label: 'Istanbul' },
    { value: 'London', label: 'London' },
  ]},
  { id: 'balance', title: 'Bakiye ($)', type: 'currency', width: 140, summaryType: 'sum' },
  { id: 'date', title: 'Tarih', type: 'date', width: 130 },
];

export default function App() {
  return (
    <div style={{ height: 600 }}>
      <SheetGL dataSource={rows} columns={columns} theme="apple-dark" batchEditMode />
    </div>
  );
}`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <h3 style={{ fontSize: 19, fontWeight: 700, margin: '8px 0 8px' }}>1. Install Package</h3>
            <CodeBlock
              id="install-en"
              title="Terminal"
              langBadge="BASH"
              code={`npm install sheetgl\n\n# Or scaffold a ready-to-use grid component:\nnpx sheetgl init`}
            />
            <h3 style={{ fontSize: 19, fontWeight: 700, margin: '24px 0 8px' }}>2. Render the Grid</h3>
            <CodeBlock
              id="usage-en"
              title="App.tsx"
              langBadge="TSX"
              code={`import { SheetGL, ColumnDef } from 'sheetgl';

const columns: ColumnDef[] = [
  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 70, readonly: true },
  { id: 'company', title: 'Company', type: 'text', width: 200, pinned: 'left' },
  { id: 'city', title: 'City', type: 'dropdown', width: 150, groupable: true, options: [
    { value: 'New York', label: 'New York' },
    { value: 'London', label: 'London' },
  ]},
  { id: 'balance', title: 'Balance ($)', type: 'currency', width: 140, summaryType: 'sum' },
  { id: 'date', title: 'Date', type: 'date', width: 130 },
];

export default function App() {
  return (
    <div style={{ height: 600 }}>
      <SheetGL dataSource={rows} columns={columns} theme="apple-dark" batchEditMode />
    </div>
  );
}`}
            />
          </div>
        ),
      },
      {
        id: 'columns',
        step: '2',
        titleTr: 'Sütun Türleri (21 Tip)',
        titleEn: 'Column Types (21 Built-in)',
        subtitleTr: 'Object/JSON, Lookup, Percent ve iletişim tipleri dahil 21 yerleşik hücre türü.',
        subtitleEn: 'All 21 built-in column types including Object/JSON, Lookup, Percent, and Contact cells.',
        contentTr: (
          <div>
            <SimpleTable
              headers={['Tip (type)', 'Örnek Değer', 'Açıklama']}
              rows={[
                ['text', '"Acme Corp"', 'Metin hücresi ve hızlı satır içi düzenleyici'],
                ['number', '42', 'Sayısal hücre (decimalDigits: 0 ile tam sayı)'],
                ['currency', '84500.50', 'Para birimi formatlama (currencySymbol: "$")'],
                ['percent', '14.8 / -3.2', 'Yüzde ve büyüme varyansı (+% yeşil / -% kırmızı)'],
                ['boolean', 'true / false', 'Tek tıkla onay kutusu'],
                ['dropdown', '"London"', 'Arama destekli açılır liste (ComboBox)'],
                ['select', '"active"', 'Renkli durum rozeti (Status Badge)'],
                ['multiselect', '["SOC2", "GDPR"]', 'Çoklu seçim etiketleri (Multiple Choice)'],
                ['lookup', '"MGR-01"', 'İlişkisel yabancı anahtar (Foreign Key) + Avatar seçici'],
                ['object', '{ tier: "VIP", sla: "99.9%" }', 'Nesne / JSON sütunu + Key-Value & JSON editörü'],
                ['date', '"2025-05-14"', 'Takvim seçicili tarih sütunu'],
                ['datetime', '"2025-05-14 14:30"', 'Takvim + Saat/Dakika seçici'],
                ['time', '"14:30"', 'Hızlı saat/dakika seçici'],
                ['email', '"finance@acme.io"', 'E-posta sütunu (✉ ikonu ile)'],
                ['url', '"https://acme.io"', 'Tıklanabilir bağlantı sütunu (↗ yeni sekmede açar)'],
                ['phone', '"+1 (415) 300-1000"', 'Formatlı telefon numarası sütunu'],
                ['color', '"#38BDF8"', 'Renk kutusu + HEX ve palet seçici'],
                ['progress', '75', 'Yüzde ilerleme çubuğu (0-100)'],
                ['rating', '4', 'Yıldız derecelendirme (1-5)'],
                ['sparkline', '[12, 25, 40, 80]', 'Mini trend grafiği + tıklanınca detay modalı'],
                ['action', 'onActionClick(row)', 'Satır içi aksiyon butonu'],
              ]}
            />
            <CodeBlock
              id="object-col-tr"
              title="Object & Lookup Sütun Kullanımı"
              langBadge="TSX"
              code={`const columns: ColumnDef[] = [
  {
    id: 'metadata',
    title: 'Meta Veri (Object)',
    type: 'object',
    width: 240,
    objectDisplayKey: 'tier', // Ana gösterim alanı + Key-Value & JSON editörü
  },
  {
    id: 'managerId',
    title: 'Yönetici (Lookup)',
    type: 'lookup',
    width: 200,
    options: [
      { value: 'MGR-01', label: 'Elena Rostova', subtitle: 'VP of Finance' },
    ],
  },
];`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <SimpleTable
              headers={['Type', 'Sample Value', 'Description']}
              rows={[
                ['text', '"Acme Corp"', 'Standard text cell and inline editor'],
                ['number', '42', 'Numeric cell (use decimalDigits: 0 for integers)'],
                ['currency', '84500.50', 'Currency formatting (currencySymbol: "$")'],
                ['percent', '14.8 / -3.2', 'Percentage & variance column (+% green / -% red)'],
                ['boolean', 'true / false', 'Single-click checkbox toggle'],
                ['dropdown', '"London"', 'Searchable ComboBox dropdown'],
                ['select', '"active"', 'Colored status badge pill'],
                ['multiselect', '["SOC2", "GDPR"]', 'Multi-choice tag chips with checkboxes'],
                ['lookup', '"MGR-01"', 'Relational foreign-key lookup with avatar & subtitle'],
                ['object', '{ tier: "VIP", sla: "99.9%" }', 'Nested Object / JSON cell + Key-Value & JSON editor'],
                ['date', '"2025-05-14"', 'Calendar date picker'],
                ['datetime', '"2025-05-14 14:30"', 'Calendar + Hour/Minute picker'],
                ['time', '"14:30"', 'Time slot & Hour/Minute picker'],
                ['email', '"finance@acme.io"', 'Email address cell with mail icon'],
                ['url', '"https://acme.io"', 'Hyperlink cell (click ↗ to open in new tab)'],
                ['phone', '"+1 (415) 300-1000"', 'Formatted phone number cell'],
                ['color', '"#38BDF8"', 'Color swatch + interactive palette/HEX picker'],
                ['progress', '75', 'Progress bar (0-100%)'],
                ['rating', '4', 'Interactive star rating (1-5)'],
                ['sparkline', '[12, 25, 40, 80]', '7-day mini chart + click-to-open modal'],
                ['action', 'onActionClick(row)', 'Interactive row button'],
              ]}
            />
            <CodeBlock
              id="object-col-en"
              title="Object & Lookup Column Definition"
              langBadge="TSX"
              code={`const columns: ColumnDef[] = [
  {
    id: 'metadata',
    title: 'Metadata (Object)',
    type: 'object',
    width: 240,
    objectDisplayKey: 'tier', // Primary display key + visual Key-Value & JSON editor
  },
  {
    id: 'managerId',
    title: 'Account Manager (Lookup)',
    type: 'lookup',
    width: 200,
    options: [
      { value: 'MGR-01', label: 'Elena Rostova', subtitle: 'VP of Finance' },
    ],
  },
];`}
            />
          </div>
        ),
      },
      {
        id: 'excel-ux',
        step: '3',
        titleTr: 'Excel Kısayolları',
        titleEn: 'Excel Shortcuts & UX',
        subtitleTr: 'Fill Handle, hücre/satır çoğaltma ve pano kısayolları.',
        subtitleEn: 'Fill Handle, cell/row duplication, and clipboard shortcuts.',
        contentTr: (
          <div>
            <SimpleTable
              headers={['Kısayol / Eylem', 'İşlev']}
              rows={[
                ['Fill Handle (Sağ Alt Kare)', 'Sürükleyerek hücreleri doldurur ve seri kodları artırır (ACC-101 → ACC-102)'],
                ['Hücre Sağ Yan (+) Butonu', 'Tıklayarak veya sürükleyerek hücreyi komşu hücrelere çoğaltır'],
                ['Ctrl + D / Ctrl + R', 'Seçili hücreyi aşağı (Down) veya sağa (Right) çoğaltır'],
                ['Shift + D', 'Aktif satırı olduğu gibi altına çoğaltır (Duplicate Row)'],
                ['Ctrl + C / Ctrl + V', 'Microsoft Excel & Google Sheets uyumlu TSV kopyala/yapıştır'],
                ['Ctrl + Z / Ctrl + Y', '100 adımlı geri al (Undo) ve ileri al (Redo)'],
                ['F2 / Çift Tık', 'Aktif hücre düzenleyicisini açar'],
                ['Sağ Tık Menüsü', 'Satır çoğaltma, satır ekleme/silme, filtreleme ve gruplama'],
              ]}
            />
          </div>
        ),
        contentEn: (
          <div>
            <SimpleTable
              headers={['Shortcut / Action', 'Behavior']}
              rows={[
                ['Fill Handle (Bottom-Right)', 'Drag to auto-fill cells and increment series (ACC-101 → ACC-102)'],
                ['Right-Side (+) Handle', 'Click or drag to duplicate active cell to neighbor cells'],
                ['Ctrl + D / Ctrl + R', 'Fill down or fill right'],
                ['Shift + D', 'Duplicate entire active row below'],
                ['Ctrl + C / Ctrl + V', 'Native Excel & Google Sheets TSV copy/paste'],
                ['Ctrl + Z / Ctrl + Y', '100-step Undo / Redo'],
                ['F2 / Double Click', 'Start inline cell editing'],
                ['Right-Click Menu', 'Duplicate row/cell, insert/delete row, filter by value, group by column'],
              ]}
            />
          </div>
        ),
      },
      {
        id: 'permissions',
        step: '4',
        titleTr: 'Yetkilendirme & Doğrulama',
        titleEn: 'Permissions & Validation',
        subtitleTr: 'Tablo, sütun ve satır bazlı yazma/salt-okunur kuralları.',
        subtitleEn: 'Grid, column, and row-level write/readonly rules.',
        contentTr: (
          <div>
            <CodeBlock
              id="perm-tr"
              title="Permissions & Validation"
              langBadge="TSX"
              code={`<SheetGL
  dataSource={data}
  permissions={{
    mode: 'write', // 'write' | 'readonly' | 'read'
    allowAdding: true,
    allowUpdating: true,
    allowDeleting: true,
    allowDuplicating: true,
  }}
  columns={[
    { id: 'id', title: 'ID', type: 'number', permission: 'readonly' },
    {
      id: 'balance',
      title: 'Bakiye',
      type: 'currency',
      canEdit: (row) => row.status !== 'rejected',
      validator: (val) => ({
        valid: Number(val) >= 0,
        message: 'Bakiye negatif olamaz!',
      }),
    },
  ]}
/>`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <CodeBlock
              id="perm-en"
              title="Permissions & Validation"
              langBadge="TSX"
              code={`<SheetGL
  dataSource={data}
  permissions={{
    mode: 'write', // 'write' | 'readonly' | 'read'
    allowAdding: true,
    allowUpdating: true,
    allowDeleting: true,
    allowDuplicating: true,
  }}
  columns={[
    { id: 'id', title: 'ID', type: 'number', permission: 'readonly' },
    {
      id: 'balance',
      title: 'Balance',
      type: 'currency',
      canEdit: (row) => row.status !== 'rejected',
      validator: (val) => ({
        valid: Number(val) >= 0,
        message: 'Balance cannot be negative!',
      }),
    },
  ]}
/>`}
            />
          </div>
        ),
      },
      {
        id: 'events',
        step: '5',
        titleTr: 'Olaylar & Backend Senkronizasyonu',
        titleEn: 'Events & Backend Cascade',
        subtitleTr: 'Sütun değiştiğinde bağımlı hücreleri backend API üzerinden otomatik güncelleme.',
        subtitleEn: 'Update dependent cells from backend APIs when a cell changes.',
        contentTr: (
          <div>
            <CodeBlock
              id="cascade-tr"
              title="setCellValue & Lifecycle Events"
              langBadge="TSX"
              code={`const columns: ColumnDef[] = [
  {
    id: 'city',
    title: 'Şehir',
    type: 'dropdown',
    options: CITY_OPTIONS,
    // Şehir değiştiğinde vergi oranını ve net bakiyeyi API'den çekip günceller
    setCellValue: async (newData, newCity, currentRow) => {
      const res = await fetch(\`/api/policy?city=\${newCity}\`);
      const { taxRate } = await res.json();
      newData.taxRate = taxRate;
      newData.netBalance = currentRow.balance * (1 - taxRate / 100);
    },
  },
];

<SheetGL
  dataSource={rows}
  columns={columns}
  onEditingStart={(e) => { if (e.row.locked) e.cancel = true; }}
  onCellValueChanging={(e) => { if (e.newValue < 0) e.cancel = true; }}
  onCellValueChanged={(e) => console.log(e.column.id, e.newValue)}
/>`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <CodeBlock
              id="cascade-en"
              title="setCellValue & Lifecycle Events"
              langBadge="TSX"
              code={`const columns: ColumnDef[] = [
  {
    id: 'city',
    title: 'City',
    type: 'dropdown',
    options: CITY_OPTIONS,
    // Fetch tax rate from backend when city changes and update dependent columns
    setCellValue: async (newData, newCity, currentRow) => {
      const res = await fetch(\`/api/policy?city=\${newCity}\`);
      const { taxRate } = await res.json();
      newData.taxRate = taxRate;
      newData.netBalance = currentRow.balance * (1 - taxRate / 100);
    },
  },
];

<SheetGL
  dataSource={rows}
  columns={columns}
  onEditingStart={(e) => { if (e.row.locked) e.cancel = true; }}
  onCellValueChanging={(e) => { if (e.newValue < 0) e.cancel = true; }}
  onCellValueChanged={(e) => console.log(e.column.id, e.newValue)}
/>`}
            />
          </div>
        ),
      },
      {
        id: 'batch-summaries',
        step: '6',
        titleTr: 'Batch Save & Özet Satırları',
        titleEn: 'Batch CRUD & Summaries',
        subtitleTr: 'Değiştirilen hücre vurgusu, toplu kayıt ve dinamik alt özetler.',
        subtitleEn: 'Modified cell highlighting, atomic batch save, and dynamic summaries.',
        contentTr: (
          <div>
            <CodeBlock
              id="batch-tr"
              title="Batch Save & Summary Configuration"
              langBadge="TSX"
              code={`<SheetGL
  dataSource={rows}
  columns={[
    { id: 'balance', title: 'Brüt Bakiye', type: 'currency', summaryType: 'sum' },
    { id: 'taxRate', title: 'Vergi (%)', type: 'progress', summaryType: 'avg' },
  ]}
  batchEditMode={true}
  onSaving={async (e) => {
    // e.changes => { inserted: [...], updated: [...], deleted: [...] }
    await fetch('/api/batch-save', {
      method: 'POST',
      body: JSON.stringify(e.changes),
    });
  }}
/>`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <CodeBlock
              id="batch-en"
              title="Batch Save & Summary Configuration"
              langBadge="TSX"
              code={`<SheetGL
  dataSource={rows}
  columns={[
    { id: 'balance', title: 'Gross Balance', type: 'currency', summaryType: 'sum' },
    { id: 'taxRate', title: 'Tax (%)', type: 'progress', summaryType: 'avg' },
  ]}
  batchEditMode={true}
  onSaving={async (e) => {
    // e.changes => { inserted: [...], updated: [...], deleted: [...] }
    await fetch('/api/batch-save', {
      method: 'POST',
      body: JSON.stringify(e.changes),
    });
  }}
/>`}
            />
          </div>
        ),
      },
    ],
    [isDark, lang, copiedCodeId]
  );

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.titleTr.toLowerCase().includes(q) ||
        s.titleEn.toLowerCase().includes(q) ||
        s.subtitleTr.toLowerCase().includes(q) ||
        s.subtitleEn.toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  const activeSection =
    filteredSections.find((s) => s.id === activeSectionId) || filteredSections[0] || sections[0];

  const currentIdx = sections.findIndex((s) => s.id === activeSection.id);
  const prevSection = currentIdx > 0 ? sections[currentIdx - 1] : null;
  const nextSection = currentIdx < sections.length - 1 ? sections[currentIdx + 1] : null;

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        backgroundColor: colors.bg,
        color: colors.text,
        overflow: 'hidden',
      }}
    >
      {/* Left Navigation Sidebar */}
      <aside
        aria-label="Documentation Navigation"
        style={{
          width: 280,
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: 18, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16 }}>
              <SheetGLLogo size={22} glow={true} />
              <span>SheetGL Docs</span>
            </div>
            {onOpenLanding && (
              <button
                type="button"
                onClick={onOpenLanding}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceAlt,
                  color: colors.text,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isTR ? 'Ana Sayfa' : 'Home'}
              </button>
            )}
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTR ? 'Konu ara...' : 'Search topics...'}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceAlt,
              color: colors.text,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredSections.map((sec) => {
            const isActive = sec.id === activeSection.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSelectSection(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: isActive ? colors.accentBg : 'transparent',
                  color: isActive ? colors.accent : colors.text,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 15,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: isActive ? colors.accent : colors.surfaceAlt,
                    color: isActive ? '#FFFFFF' : colors.muted,
                    flexShrink: 0,
                  }}
                >
                  {sec.step}
                </span>
                <span>{isTR ? sec.titleTr : sec.titleEn}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: 14, borderTop: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            onClick={onOpenStudio}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: colors.accent,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {isTR ? 'Canlı Demo (/demo) →' : 'Live Demo (/demo) →'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {onToggleLang && (
              <button
                type="button"
                onClick={onToggleLang}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 7,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceAlt,
                  color: colors.text,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lang.toUpperCase()}
              </button>
            )}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 7,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceAlt,
                  color: colors.text,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isDark ? 'Dark' : 'Light'}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '38px 52px',
        }}
      >
        <article style={{ maxWidth: 880, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {isTR ? activeSection.titleTr : activeSection.titleEn}
          </h1>
          <p style={{ fontSize: 17, color: colors.muted, margin: '0 0 26px 0', lineHeight: 1.6 }}>
            {isTR ? activeSection.subtitleTr : activeSection.subtitleEn}
          </p>

          <div style={{ fontSize: 16, lineHeight: 1.7 }}>
            {isTR ? activeSection.contentTr : activeSection.contentEn}
          </div>

          {/* Previous / Next Easy Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              marginTop: 36,
              paddingTop: 20,
              borderTop: `1px solid ${colors.border}`,
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
                  textAlign: 'left',
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
                  textAlign: 'right',
                }}
              >
                {isTR ? nextSection.titleTr : nextSection.titleEn} →
              </button>
            )}
          </div>
        </article>
      </main>
    </div>
  );
};
