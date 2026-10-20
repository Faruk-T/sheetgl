import React, { useState, useMemo } from 'react';

export interface DocsPortalProps {
  isDark: boolean;
  lang: 'tr' | 'en';
  onOpenStudio: () => void;
}

interface DocSection {
  id: string;
  badge: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
  contentTr: React.ReactNode;
  contentEn: React.ReactNode;
}

export const DocsPortal: React.FC<DocsPortalProps> = ({ isDark, lang, onOpenStudio }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('quickstart');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const isTR = lang === 'tr';

  const colors = {
    bg: isDark ? '#0B0F17' : '#F8FAFC',
    surface: isDark ? '#111827' : '#FFFFFF',
    surfaceAlt: isDark ? '#1E293B' : '#F1F5F9',
    border: isDark ? '#1F2937' : '#E2E8F0',
    text: isDark ? '#F9FAFB' : '#0F172A',
    muted: isDark ? '#9CA3AF' : '#64748B',
    accent: isDark ? '#38BDF8' : '#0284C7',
    accentBg: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
    codeBg: isDark ? '#090D16' : '#0F172A',
    codeText: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId((prev) => (prev === id ? null : prev)), 1800);
  };

  const CodeBlock: React.FC<{ id: string; title: string; code: string }> = ({ id, title, code }) => (
    <div
      style={{
        margin: '16px 0',
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.codeBg,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          color: '#94A3B8',
          fontSize: 12,
          fontFamily: 'monospace',
        }}
      >
        <span>{title}</span>
        <button
          type="button"
          onClick={() => copyCode(id, code)}
          style={{
            padding: '3px 10px',
            borderRadius: 5,
            border: '1px solid rgba(255,255,255,0.16)',
            backgroundColor: copiedCodeId === id ? '#10B981' : 'transparent',
            color: '#FFFFFF',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {copiedCodeId === id ? (isTR ? '✓ Kopyalandı' : '✓ Copied') : isTR ? 'Kodu Kopyala' : 'Copy Code'}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 16,
          overflowX: 'auto',
          color: colors.codeText,
          fontSize: 12.5,
          lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );

  const Callout: React.FC<{ type?: 'info' | 'tip' | 'warn'; title: string; children: React.ReactNode }> = ({
    type = 'info',
    title,
    children,
  }) => {
    const borderColor =
      type === 'tip' ? colors.success : type === 'warn' ? colors.warning : colors.accent;
    return (
      <div
        style={{
          margin: '16px 0',
          padding: '14px 16px',
          borderRadius: 8,
          backgroundColor: colors.surfaceAlt,
          borderLeft: `4px solid ${borderColor}`,
          fontSize: 13.5,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4, color: borderColor }}>{title}</div>
        <div style={{ color: colors.text }}>{children}</div>
      </div>
    );
  };

  const sections: DocSection[] = useMemo(
    () => [
      {
        id: 'quickstart',
        badge: '01',
        titleTr: 'Hızlı Başlangıç & Kurulum',
        titleEn: 'Quick Start & Installation',
        descTr: 'SheetGL Pro v2.0 kurulumu, temel yapılandırma ve ilk 60 FPS Excel tablonuzu oluşturma.',
        descEn: 'Install SheetGL Pro v2.0, configure columns, and launch your first 60 FPS Excel DataGrid.',
        contentTr: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              <strong>SheetGL Pro v2.0</strong>, Google Sheets'in <strong>HTML5 2D Canvas sanallaştırma hızını (60 FPS)</strong> ve Microsoft Excel'in hücre etkileşimlerini, <strong>DevExtreme DataGrid</strong>'in kurumsal olay tetikleyicileri (event triggers), dinamik özetleri, grup motoru ve yetkilendirme mimarisiyle birleştiren sıfır bağımlılıklı React veri tablosudur.
            </p>
            <CodeBlock
              id="install-cmd"
              title="Terminal"
              code={`npm install sheetgl\n# veya\npnpm add sheetgl`}
            />
            <h3 style={{ marginTop: 24 }}>Temel Kullanım</h3>
            <CodeBlock
              id="basic-usage-tr"
              title="App.tsx"
              code={`import React, { useMemo, useState } from 'react';
import { SheetGL, ColumnDef } from './datagrid';

export function FinancialGrid() {
  const [rows] = useState([
    { id: 1, code: 'ACC-1001', company: 'Acme Holding', city: 'New York', balance: 84500, taxRate: 18, netBalance: 69290, date: '2025-05-14', isApproved: true },
    { id: 2, code: 'ACC-1002', company: 'Nexus Cloud', city: 'London', balance: 125000, taxRate: 20, netBalance: 100000, date: '2025-06-01', isApproved: false },
  ]);

  const columns = useMemo<ColumnDef[]>(() => [
    { id: 'id', title: 'ID', type: 'number', width: 70, pinned: 'left', readonly: true },
    { id: 'code', title: 'Hesap Kodu', type: 'text', width: 130, pinned: 'left' },
    { id: 'company', title: 'Şirket Adı', type: 'text', width: 220, pinned: 'left' },
    { id: 'city', title: 'Şehir', type: 'text', width: 140, groupable: true },
    { id: 'balance', title: 'Brüt Bakiye ($)', type: 'currency', width: 150, currencySymbol: '$', summaryType: 'sum' },
    { id: 'date', title: 'Kayıt Tarihi', type: 'date', width: 140 },
    { id: 'isApproved', title: 'Onaylı', type: 'boolean', width: 100 },
  ], []);

  return (
    <div style={{ width: '100%', height: '650px' }}>
      <SheetGL
        dataSource={rows}
        columns={columns}
        theme="apple-dark"
        locale="tr"
        batchEditMode={true}
      />
    </div>
  );
}`}
            />
            <Callout type="tip" title="Sıfır DOM Şişkinliği (Zero DOM Bloat)">
              Geleneksel DOM tabanlı tablolar 10.000 satırda binlerce HTML düğümü oluştururken, SheetGL tüm hücreleri tek bir yüksek DPI <code>&lt;canvas&gt;</code> katmanında çizer ve yalnızca aktif düzenlenen hücre için mikro-DOM editörü açar.
            </Callout>
          </div>
        ),
        contentEn: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              <strong>SheetGL Pro v2.0</strong> combines <strong>Google Sheets 60 FPS HTML5 Canvas virtualization</strong> and native Microsoft Excel interactions with <strong>DevExtreme DataGrid</strong> enterprise event triggers, cascading backend lookups, configurable summaries, and role-based permissions.
            </p>
            <CodeBlock
              id="install-cmd-en"
              title="Terminal"
              code={`npm install sheetgl\n# or\npnpm add sheetgl`}
            />
            <h3 style={{ marginTop: 24 }}>Basic Setup</h3>
            <CodeBlock
              id="basic-usage-en"
              title="App.tsx"
              code={`import React, { useMemo, useState } from 'react';
import { SheetGL, ColumnDef } from './datagrid';

export function FinancialGrid() {
  const [rows] = useState([
    { id: 1, code: 'ACC-1001', company: 'Acme Holding', city: 'New York', balance: 84500, date: '2025-05-14', isApproved: true },
    { id: 2, code: 'ACC-1002', company: 'Nexus Cloud', city: 'London', balance: 125000, date: '2025-06-01', isApproved: false },
  ]);

  const columns = useMemo<ColumnDef[]>(() => [
    { id: 'id', title: 'ID', type: 'number', width: 70, pinned: 'left', readonly: true },
    { id: 'code', title: 'Account Code', type: 'text', width: 130, pinned: 'left' },
    { id: 'company', title: 'Company', type: 'text', width: 220, pinned: 'left' },
    { id: 'city', title: 'City', type: 'text', width: 140, groupable: true },
    { id: 'balance', title: 'Balance ($)', type: 'currency', width: 150, currencySymbol: '$', summaryType: 'sum' },
    { id: 'date', title: 'Registered Date', type: 'date', width: 140 },
    { id: 'isApproved', title: 'Approved', type: 'boolean', width: 100 },
  ], []);

  return (
    <div style={{ width: '100%', height: '650px' }}>
      <SheetGL
        dataSource={rows}
        columns={columns}
        theme="apple-dark"
        locale="en"
        batchEditMode={true}
      />
    </div>
  );
}`}
            />
          </div>
        ),
      },
      {
        id: 'excel-ux',
        badge: '02',
        titleTr: 'Excel Deneyimi: Hücre & Satır Çoğaltma, Sağ Tık & Pano',
        titleEn: 'Excel UX: Fill Handle, Cell/Row Duplication, Right-Click & Clipboard',
        descTr: 'Köşe doldurma tutamacı (Fill Handle), hücre sağ yanındaki hızlı çoğaltma butonu, sağ tık menüsü ve Excel kopyala/yapıştır.',
        descEn: 'Bottom-right Fill Handle drag, right-side quick cell duplicate button, context menu, and TSV Excel Copy/Paste.',
        contentTr: (
          <div>
            <h3>1. Hücre Çoğaltma ve Otomatik Doldurma (AutoFill & Quick Duplicate)</h3>
            <p style={{ lineHeight: 1.7 }}>
              SheetGL, Microsoft Excel'deki tüm hücre ve satır çoğaltma yöntemlerini birebir destekler:
            </p>
            <ul style={{ lineHeight: 1.8 }}>
              <li>
                <strong>Köşe Doldurma Tutamacı (Bottom-Right Fill Handle):</strong> Seçili hücrenin veya aralığın sağ alt köşesindeki kare tutamacı aşağı, yukarı, sağa veya sola sürükleyerek değerleri hedef hücrelere çoğaltabilirsiniz. <code>ACC-100001</code> gibi seri kodları sürüklediğinizde otomatik olarak <code>ACC-100002, ACC-100003</code> şeklinde akıllı seri artırımı yapar!
              </li>
              <li>
                <strong>Hücre Sağ Yanındaki Hızlı Çoğaltma Butonu (<code>+</code> Handle):</strong> Aktif seçimin sağ kenarının ortasında yer alan mavi <code>+</code> tutamacına tek tıklayarak hücreyi anında çoğaltabilir veya sürükleyerek komşu hücrelere yayabilirsiniz.
              </li>
              <li>
                <strong>Klavye Kısayolları:</strong>
                <ul>
                  <li><code>Ctrl + D</code>: Seçili hücreyi aşağı çoğaltır (veya çoklu satır seçiliyse en üst satırı alt satırlara doldurur).</li>
                  <li><code>Ctrl + R</code>: Seçili hücreyi sağdaki sütuna çoğaltır.</li>
                  <li><code>Shift + D</code>: Seçili satırın tamamını klonlayarak hemen altına yeni bir satır olarak çoğaltır.</li>
                </ul>
              </li>
            </ul>

            <h3>2. Sağ Tık Bağlam Menüsü (Right-Click Context Menu)</h3>
            <p style={{ lineHeight: 1.7 }}>
              Herhangi bir <strong>hücreye</strong>, <strong>satır numarasına</strong> veya <strong>sütun başlığına</strong> sağ tıklayarak özel bağlam menüsünü açabilirsiniz:
            </p>
            <ul style={{ lineHeight: 1.8 }}>
              <li><strong>Hücre / Satır Sağ Tık Menüsü:</strong> Kopyala, Yapıştır, Hücreyi Aşağı Çoğalt, Hücreyi Sağa Çoğalt, <strong>Satırı Çoğalt (Duplicate Row)</strong>, Üste/Alta Yeni Satır Ekle, Bu Hücre Değerine Göre Filtrele, Bu Sütuna Göre Grupla, Hücreyi Temizle, Satırı Sil.</li>
              <li><strong>Sütun Başlığı Sağ Tık Menüsü:</strong> Artan/Azalan Sırala, Sola Sabitle (Pin/Unpin), Grupla, Sütun Yetkisini Değiştir (<code>Write</code> / <code>Read-Only 🔒</code>), Alt Özet Tipini Seç (<code>SUM, AVG, MIN, MAX, COUNT, NONE</code>).</li>
            </ul>

            <h3>3. Microsoft Excel & Google Sheets Pano Entegrasyonu (TSV Copy/Paste)</h3>
            <p style={{ lineHeight: 1.7 }}>
              <code>Ctrl + C</code> ve <code>Ctrl + V</code> standart TSV (Tab-Separated Values) protokolünü kullanır. Excel'den kopyaladığınız çok satırlı ve çok sütunlu bir tabloyu doğrudan SheetGL içine yapıştırabilirsiniz. Tek bir hücre kopyalayıp SheetGL'de 20 hücrelik bir alan seçerek <code>Ctrl + V</code> yaparsanız, tıpkı Excel'deki gibi seçili tüm hücreler o değerle doldurulur.
            </p>
          </div>
        ),
        contentEn: (
          <div>
            <h3>1. Cell Duplication & AutoFill Handle</h3>
            <p style={{ lineHeight: 1.7 }}>
              SheetGL natively implements every cell and row duplication workflow expected from Microsoft Excel:
            </p>
            <ul style={{ lineHeight: 1.8 }}>
              <li>
                <strong>Bottom-Right Fill Handle:</strong> Drag the square handle at the bottom-right corner of any selection vertically or horizontally to fill target cells. Sequential patterns like <code>ACC-100001</code> automatically increment (<code>ACC-100002, ACC-100003</code>).
              </li>
              <li>
                <strong>Right-Side Quick Duplicate Button (<code>+</code> Pill):</strong> Click the accent <code>+</code> handle centered on the right border of the active cell to immediately duplicate the value, or drag it across adjacent cells.
              </li>
              <li>
                <strong>Keyboard Shortcuts:</strong> <code>Ctrl + D</code> (Fill Down), <code>Ctrl + R</code> (Fill Right), and <code>Shift + D</code> (Duplicate Entire Row).
              </li>
            </ul>

            <h3>2. Right-Click Context Menu</h3>
            <p style={{ lineHeight: 1.7 }}>
              Right-click any cell, row number, or column header to access context-sensitive actions including <strong>Duplicate Row</strong>, <strong>Duplicate Cell Down/Right</strong>, <strong>Insert Row Above/Below</strong>, <strong>Filter by Cell Value</strong>, <strong>Pin Column</strong>, and <strong>Summary Type Configuration</strong>.
            </p>
          </div>
        ),
      },
      {
        id: 'permissions',
        badge: '03',
        titleTr: 'Yetkilendirme (Permissions) & Sütun Davranışları',
        titleEn: 'Permissions (Write / Read / ReadOnly) & Column Rules',
        descTr: 'Tablo, sütun ve satır bazlı read / write / readonly izinleri ve koşullu düzenleme kuralları.',
        descEn: 'Grid-level, column-level, and row-level conditional permissions (write, read, readonly).',
        contentTr: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              SheetGL, kurumsal uygulamalardaki rol bazlı yetkilendirme (RBAC) gereksinimleri için <strong>3 katmanlı izin kontrolü</strong> sunar:
            </p>
            <ol style={{ lineHeight: 1.8 }}>
              <li><strong>Tablo Seviyesi İzinler (<code>permissions</code> prop):</strong> Tüm tablonun <code>write</code>, <code>readonly</code> veya <code>read</code> modunda çalışmasını ve satır ekleme, silme, çoğaltma, panodan yapıştırma gibi eylemlerin ayrı ayrı kısıtlanmasını sağlar.</li>
              <li><strong>Sütun Seviyesi İzinler (<code>ColumnDef.permission</code> & <code>readonly</code>):</strong> Salt okunur sütunların başlığında otomatik olarak <code>🔒</code> ikonu gösterilir ve bu sütunlara çift tıklama, klavyeden yazma, <code>Delete</code> tuşu, Excel'den yapıştırma veya Fill Handle ile sürükleme yoluyla müdahale edilmesi engellenir.</li>
              <li><strong>Satır / Hücre Bazlı Dinamik Kural (<code>ColumnDef.canEdit</code> & <code>onEditingStart</code>):</strong> Örneğin durumu <code>"rejected" (İptal Edildi)</code> olan bir satırın düzenlenmesini dinamik olarak kilitleyebilirsiniz.</li>
            </ol>

            <CodeBlock
              id="permissions-code"
              title="Permissions & Conditional Column Rules"
              code={`<SheetGL
  dataSource={data}
  permissions={{
    mode: 'write',           // 'write' | 'readonly' | 'read'
    allowAdding: true,       // Yeni satır ekleme izni
    allowUpdating: true,     // Hücre düzenleme izni
    allowDeleting: true,     // Satır silme izni
    allowDuplicating: true,  // Satır ve hücre çoğaltma izni
    allowClipboardPaste: true,
    allowBatchSave: true,
  }}
  columns={[
    {
      id: 'id',
      title: 'ID',
      type: 'number',
      width: 70,
      permission: 'readonly', // 🔒 Her zaman salt okunur
    },
    {
      id: 'balance',
      title: 'Balance ($)',
      type: 'currency',
      width: 150,
      permission: 'write',
      // Koşullu izin: İptal edilmiş (rejected) kayıtlarda bakiye değiştirilemez!
      canEdit: (row) => row.status !== 'rejected',
      // Veri doğrulama (Validation)
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
            <p style={{ lineHeight: 1.7 }}>
              SheetGL enforces a <strong>3-tier permission model</strong> across every interaction surface (inline editors, zero-DOM toggles, Formula Bar, keyboard Delete, Clipboard Paste, and Fill Handle drag):
            </p>
            <CodeBlock
              id="permissions-code-en"
              title="Permissions & Conditional Column Rules"
              code={`<SheetGL
  dataSource={data}
  permissions={{
    mode: 'write',           // 'write' | 'readonly' | 'read'
    allowAdding: true,
    allowUpdating: true,
    allowDeleting: true,
    allowDuplicating: true,
    allowClipboardPaste: true,
    allowBatchSave: true,
  }}
  columns={[
    {
      id: 'id',
      title: 'ID',
      type: 'number',
      width: 70,
      permission: 'readonly', // 🔒 Locked column
    },
    {
      id: 'balance',
      title: 'Balance ($)',
      type: 'currency',
      width: 150,
      permission: 'write',
      // Conditional rule: disallow editing balance if row status is 'rejected'
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
        id: 'triggers-cascading',
        badge: '04',
        titleTr: 'DevExtreme Event Trigger & Backend Dinamik Güncelleme',
        titleEn: 'DevExtreme Event Triggers & Async Cascading Backend Updates',
        descTr: 'Bir sütun güncellendiğinde ilişkili diğer sütunların doğrudan backend API üzerinden çekilip otomatik güncellenmesi.',
        descEn: 'Automatically fetch and update dependent columns from the backend when a column value changes.',
        contentTr: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              DevExtreme DataGrid'deki <code>setCellValue</code> ve yaşam döngüsü olay tetikleyicileri (<code>onEditingStart</code>, <code>onCellValueChanging</code>, <code>onCellValueChanged</code>, <code>onRowInserting</code>, <code>onRowUpdating</code>, <code>onSaving</code>, <code>onSaved</code>) SheetGL'de birinci sınıf (first-class) asenkron mimariyle desteklenir.
            </p>
            <Callout type="tip" title="Asenkron Backend Cascading Güncellemesi Nasıl Çalışır?">
              Bir sütunun <code>setCellValue</code> veya tablonun <code>onCellValueChanged</code> kancası bir <code>Promise</code> döndürdüğünde, SheetGL ilgili satırın sol numara sütununda canlı bir <code>⟳</code> senkronizasyon göstergesi çizer, backend yanıtını bekler ve dönen bağımlı sütun değerlerini (ör. Vergi Oranı, Net Bakiye, Bölge Yöneticisi, Risk Skoru) aynı satırda otomatik olarak günceller! Üstelik <code>Ctrl + Z</code> yaptığınızda hem ana hücre hem de backend'den güncellenen tüm bağımlı sütunlar tek adımda geri alınır.
            </Callout>

            <CodeBlock
              id="cascading-code"
              title="Cascading Backend Lookup & DevExtreme Event Triggers"
              code={`const columns: ColumnDef[] = [
  {
    id: 'city',
    title: 'Region / City',
    type: 'text',
    width: 140,
    // Şehir değiştiğinde Backend API'den o şehrin vergi oranını ve kredi limitini çekip satırı güncelle!
    setCellValue: async (newData, newCity, currentRow) => {
      const res = await fetch(\`/api/region-policy?city=\${encodeURIComponent(newCity)}\`);
      const policy = await res.json();
      
      newData.taxRate = policy.taxRate;
      newData.netBalance = Math.round(currentRow.balance * (1 - policy.taxRate / 100));
      newData.rating = policy.defaultTrustScore;
    },
  },
  {
    id: 'balance',
    title: 'Gross Balance ($)',
    type: 'currency',
    width: 150,
    // Bakiye değiştiğinde Net Bakiyeyi anında yeniden hesapla
    setCellValue: (newData, newBalance, currentRow) => {
      const tax = currentRow.taxRate ?? 18;
      newData.netBalance = Math.round(Number(newBalance) * (1 - tax / 100) * 100) / 100;
    },
  },
];

<SheetGL
  dataSource={data}
  columns={columns}
  onEditingStart={(e) => {
    if (e.row.isLocked) e.cancel = true;
  }}
  onCellValueChanging={(e) => {
    if (e.column.id === 'balance' && e.newValue > 10_000_000) {
      e.cancel = true;
      e.errorMessage = 'Maksimum işlem limiti aşıldı!';
    }
  }}
  onCellValueChanged={async (e) => {
    console.log('Değişen hücre:', e.column.id, e.oldValue, '->', e.newValue);
    // İstenirse e.updateRow({ ... }) ile ek alanlar da güncellenebilir
  }}
/>`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              SheetGL implements DevExtreme's complete event lifecycle (<code>onEditingStart</code>, <code>onCellValueChanging</code>, <code>onCellValueChanged</code>, <code>onRowInserting</code>, <code>onRowInserted</code>, <code>onRowUpdating</code>, <code>onRowUpdated</code>, <code>onRowRemoving</code>, <code>onRowRemoved</code>, <code>onSaving</code>, <code>onSaved</code>) plus column-level <code>setCellValue</code> cascading hooks.
            </p>
            <CodeBlock
              id="cascading-code-en"
              title="Cascading Backend Lookup & DevExtreme Event Triggers"
              code={`const columns: ColumnDef[] = [
  {
    id: 'city',
    title: 'Region / City',
    type: 'text',
    width: 140,
    // When 'city' changes, fetch regional tax policy from backend and update dependent columns!
    setCellValue: async (newData, newCity, currentRow) => {
      const res = await fetch(\`/api/region-policy?city=\${encodeURIComponent(newCity)}\`);
      const policy = await res.json();
      
      newData.taxRate = policy.taxRate;
      newData.netBalance = Math.round(currentRow.balance * (1 - policy.taxRate / 100));
      newData.rating = policy.defaultTrustScore;
    },
  },
];`}
            />
          </div>
        ),
      },
      {
        id: 'crud-batch',
        badge: '05',
        titleTr: 'CRUD, Dirty Hücre Takibi & Batch Save Sistemi',
        titleEn: 'CRUD Operations, Dirty Tracking & Batch Save System',
        descTr: 'Satır ekleme, satır çoğaltma, silme, değiştirilen hücrelerin işaretlenmesi ve tek tıkla Batch Save / Discard.',
        descEn: 'Row insertion, row duplication, deletion, dirty cell corner indicators, and atomic Batch Save / Discard.',
        contentTr: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              <code>batchEditMode=&#123;true&#125;</code> aktif olduğunda yapılan tüm satır eklemeleri (<code>inserted</code>), hücre düzenlemeleri (<code>updated</code>) ve satır silmeleri (<code>deleted</code>) bellekte izlenir:
            </p>
            <ul style={{ lineHeight: 1.8 }}>
              <li><strong>Kirli Hücre İşaretçisi (Dirty Indicator):</strong> Değiştirilen her hücrenin sağ üst köşesinde yeşil bir üçgen işaretçi belirir. Hücreyi eski değerine döndürürseniz işaretçi otomatik olarak kalkar.</li>
              <li><strong>Yeni Eklenen / Çoğaltılan Satırlar:</strong> Sol satır numarası sütununda yeşil bir şerit ile vurgulanır.</li>
              <li><strong>Toplu Kayıt (Batch Save) & Geri Alma (Discard):</strong> Üst araç çubuğunda bekleyen değişiklik sayısı canlı olarak gösterilir. <strong>Toplu Kaydet</strong> butonuna basıldığında <code>onSaving</code> ve <code>onSaved</code> olayları tetiklenerek tüm değişiklik paketi (<code>&#123; inserted, updated, deleted &#125;</code>) tek seferde sunucuya gönderilir. <strong>Geri Al (Discard)</strong> butonuna basıldığında ise tüm değişiklikler ilk haline döndürülür.</li>
            </ul>
            <CodeBlock
              id="batch-save-code"
              title="Batch Save Lifecycle"
              code={`<SheetGL
  dataSource={data}
  columns={columns}
  batchEditMode={true}
  onSaving={async (e) => {
    // e.changes => { inserted: [...], updated: [{ key, values }], deleted: [...] }
    await fetch('/api/accounts/batch', {
      method: 'POST',
      body: JSON.stringify(e.changes),
    });
  }}
  onSaved={(e) => {
    console.log('Batch başarıyla kaydedildi:', e.changes);
  }}
/>`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              When <code>batchEditMode=&#123;true&#125;</code> is enabled, all inserted rows, modified cells, and deleted rows are tracked non-destructively with visual Canvas markers (green top-right cell triangle for modified cells, green gutter bar for newly inserted/duplicated rows).
            </p>
            <CodeBlock
              id="batch-save-code-en"
              title="Batch Save Lifecycle"
              code={`<SheetGL
  dataSource={data}
  columns={columns}
  batchEditMode={true}
  onSaving={async (e) => {
    // e.changes => { inserted: [...], updated: [{ key, values }], deleted: [...] }
    await fetch('/api/accounts/batch', {
      method: 'POST',
      body: JSON.stringify(e.changes),
    });
  }}
  onSaved={(e) => {
    console.log('Batch committed:', e.changes);
  }}
/>`}
            />
          </div>
        ),
      },
      {
        id: 'summaries-filters',
        badge: '06',
        titleTr: 'Dinamik Özet Satırları (Summaries), Filtreleme & Gruplama',
        titleEn: 'Dynamic Summary Rows, Multi-Column Filters & Grouping',
        descTr: 'İstediğiniz sütuna SUM, AVG, MIN, MAX, COUNT atama, canlı seçim özetleri ve çift modlu Excel filtreleri.',
        descEn: 'Runtime configurable column summaries (SUM, AVG, MIN, MAX, COUNT), live selection stats, and dual-mode Excel filters.',
        contentTr: (
          <div>
            <h3>1. Dinamik Özet Satırları (Configurable Footer & Group Summaries)</h3>
            <p style={{ lineHeight: 1.7 }}>
              Alt özet çubuğundaki (Summary Footer) herhangi bir sütun özetine tıklayarak veya <strong>+ Özet Ayarla</strong> menüsünü kullanarak çalışma zamanında (runtime) istediğiniz sütunun özet tipini değiştirebilirsiniz:
            </p>
            <ul style={{ lineHeight: 1.8 }}>
              <li><code>SUM</code>: Filtrelenmiş kayıtların toplamı</li>
              <li><code>AVG</code>: Aritmetik ortalama</li>
              <li><code>MIN</code> / <code>MAX</code>: En küçük ve en büyük değer</li>
              <li><code>COUNT</code>: Dolu kayıt sayısı</li>
              <li><strong>Canlı Seçim Özeti (Excel Status Bar):</strong> Fareyle veya klavyeyle birden fazla hücre seçtiğinizde alt çubukta anında seçili hücrelerin <code>Count, SUM, AVG, MIN, MAX</code> değerleri hesaplanır!</li>
            </ul>

            <h3>2. Çift Modlu Excel Başlık Filtreleri (Değer Listesi + Koşul Kuralı)</h3>
            <p style={{ lineHeight: 1.7 }}>
              Her sütun başlığının sağındaki huni butonuna tıkladığınızda açılan popover iki sekme sunar:
            </p>
            <ul style={{ lineHeight: 1.8 }}>
              <li><strong>Değer Listesi (Values):</strong> Benzersiz değerleri kayıt sayılarıyla listeler. Arama kutusunda filtreleme yaparken mevcut seçimleriniz korunur ve filtrelenmiş bir sütunu tekrar açtığınızda yalnızca seçili bıraktığınız değerler işaretli gelir.</li>
              <li><strong>Koşul Filtresi (Condition Rule):</strong> <code>Contains, Equals, Starts with, Greater than (&gt;), Less than (&lt;), Between</code> gibi operatörlerle özel filtre kuralları tanımlamanızı sağlar.</li>
            </ul>
          </div>
        ),
        contentEn: (
          <div>
            <h3>1. Dynamic Summary Rows & Live Selection Aggregations</h3>
            <p style={{ lineHeight: 1.7 }}>
              Click any summary badge in the footer or open the <strong>+ Summaries</strong> popover to switch any column between <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>, <code>COUNT</code>, or <code>NONE</code> in real time. Both the footer and group header rows update instantaneously. Selecting multiple cells on the grid also computes live Excel status bar stats (<code>Count, SUM, AVG, MIN, MAX</code>).
            </p>
            <h3>2. Dual-Mode Excel Header Filter Popover</h3>
            <p style={{ lineHeight: 1.7 }}>
              Combine multiple column filters using either the <strong>Distinct Value Checkbox List</strong> (preserving checked state across searches and reopenings) or <strong>Condition Rules</strong> (<code>contains, =, &lt;&gt;, &gt;, &lt;, between</code>).
            </p>
          </div>
        ),
      },
      {
        id: 'custom-plugins',
        badge: '07',
        titleTr: 'Yerleşik 14 Sütun Türü & Özel Sütun Eklentileri (Column Plugins)',
        titleEn: '14 Built-in Column Types & Custom Column Plugins',
        descTr: 'text, number, currency, boolean, dropdown, select, multiselect, date, datetime, time, progress, rating, sparkline, action.',
        descEn: 'text, number, currency, boolean, dropdown, select, multiselect, date, datetime, time, progress, rating, sparkline, action.',
        contentTr: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              SheetGL'de her sütun tipi <code>IColumnTypePlugin</code> arayüzünü uygulayan bağımsız bir eklentidir. Kutudan çıktığı haliyle <strong>14 zengin sütun türü</strong> hazır gelir:
            </p>
            <ul style={{ lineHeight: 1.8 }}>
              <li><code>text</code> / <code>number</code> / <code>currency</code>: Metin, sayı ve para birimi formatlama</li>
              <li><code>dropdown</code>: Klasik açılır liste (ComboBox) seçici ve arama destekli editör</li>
              <li><code>select</code>: Renkli durum rozeti (Status Badge) tekli seçim sütunu</li>
              <li><code>multiselect</code>: Çoklu seçim (Multiple Choice) etiket sütunu; onay kutulu açılır liste ve taşma rozeti (<code>+N</code>)</li>
              <li><code>date</code>: Etkileşimli aylık takvim açılır menülü tarih sütunu (<code>YYYY-MM-DD</code>)</li>
              <li><code>datetime</code>: Takvim + Saat/Dakika seçicili tarih ve saat sütunu (<code>YYYY-MM-DD HH:mm</code>)</li>
              <li><code>time</code>: Hızlı saat dilimi çipleri ve saat/dakika seçicili saat sütunu (<code>HH:mm</code>)</li>
              <li><code>boolean</code> / <code>rating</code> / <code>progress</code> / <code>sparkline</code> / <code>action</code>: Doğrudan Canvas üzerinde etkileşimli görsel bileşenler</li>
            </ul>
            <CodeBlock
              id="custom-plugin-code"
              title="Custom Status Pill Plugin"
              code={`import { ColumnTypeRegistry, IColumnTypePlugin } from './datagrid';

export const RiskBadgePlugin: IColumnTypePlugin<number> = {
  type: 'riskBadge',
  paint({ ctx, value, x, y, width, height, theme }) {
    const score = Number(value) || 0;
    const color = score > 75 ? '#EF4444' : score > 40 ? '#F59E0B' : '#10B981';
    ctx.save();
    ctx.fillStyle = color + '22';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 6, width - 16, height - 12, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = \`700 11px \${theme.fontFamily}\`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(\`Risk: \${score}%\`, x + width / 2, y + height / 2);
    ctx.restore();
  },
};

ColumnTypeRegistry.register(RiskBadgePlugin);`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <p style={{ lineHeight: 1.7 }}>
              Every column type in SheetGL is an isolated plugin implementing <code>IColumnTypePlugin</code>. You can register custom Canvas painters and React micro-DOM editors at runtime via <code>ColumnTypeRegistry.register(...)</code>.
            </p>
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
        s.descTr.toLowerCase().includes(q) ||
        s.descEn.toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  const activeSection =
    filteredSections.find((s) => s.id === activeSectionId) || filteredSections[0] || sections[0];

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
      {/* Left Sidebar Navigation */}
      <aside
        style={{
          width: 300,
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
            📚 {isTR ? 'SheetGL Dokümantasyon' : 'SheetGL Documentation'}
          </div>
          <div style={{ fontSize: 12, color: colors.muted, marginBottom: 12 }}>
            {isTR
              ? 'Mimari, API Referansı ve Excel UX Rehberi'
              : 'Architecture, API Reference & Excel UX Guide'}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTR ? 'Dokümantasyonda ara...' : 'Search documentation...'}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 7,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceAlt,
              color: colors.text,
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredSections.map((sec) => {
            const isActive = sec.id === activeSection.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${isActive ? colors.accent : 'transparent'}`,
                  backgroundColor: isActive ? colors.accentBg : 'transparent',
                  color: colors.text,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 5,
                    backgroundColor: isActive ? colors.accent : colors.surfaceAlt,
                    color: isActive ? '#FFFFFF' : colors.muted,
                    fontFamily: 'monospace',
                  }}
                >
                  {sec.badge}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 2 }}>
                    {isTR ? sec.titleTr : sec.titleEn}
                  </div>
                  <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.35 }}>
                    {isTR ? sec.descTr : sec.descEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: 14, borderTop: `1px solid ${colors.border}` }}>
          <button
            type="button"
            onClick={onOpenStudio}
            style={{
              width: '100%',
              padding: '9px 14px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: colors.accent,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            ⚡ {isTR ? 'Canlı Excel Stüdyosunu Aç' : 'Open Live Excel Studio'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 48px',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 20,
              backgroundColor: colors.accentBg,
              color: colors.accent,
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <span>SECTION {activeSection.badge}</span>
            <span>•</span>
            <span>SHEETGL PRO v2.0</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0' }}>
            {isTR ? activeSection.titleTr : activeSection.titleEn}
          </h1>
          <p style={{ fontSize: 15, color: colors.muted, margin: '0 0 24px 0', lineHeight: 1.6 }}>
            {isTR ? activeSection.descTr : activeSection.descEn}
          </p>

          <div
            style={{
              padding: 24,
              borderRadius: 14,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              fontSize: 14,
            }}
          >
            {isTR ? activeSection.contentTr : activeSection.contentEn}
          </div>
        </div>
      </main>
    </div>
  );
};
