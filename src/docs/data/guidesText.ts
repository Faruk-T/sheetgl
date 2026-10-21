import { ColumnGuideItem } from '../types';

export const TEXT_GUIDES: ColumnGuideItem[] = [
  {
    type: 'text',
    colId: 'code',
    category: 'text',
    categoryLabelTr: 'Metin & İletişim',
    categoryLabelEn: 'Text & Contact',
    titleTr: 'Metin Sütunu (Text)',
    titleEn: 'Text Column (text)',
    dataType: 'string',
    sampleValue: '"ACC-100001" | "Acme Global Holding"',
    summaryTr:
      'Genel amaçlı metin, şirket adı, açıklama veya seri numarası sütunları için kullanılır. Fill Handle ile sürüklenirken "ACC-100001" gibi seri kodlarını otomatik olarak "ACC-100002" şeklinde artırır.',
    summaryEn:
      'General-purpose string column for names, descriptions, and serial codes. Supports automatic smart series increment (e.g. "ACC-100001" → "ACC-100002") when dragging the Excel Fill Handle.',
    editorTr: 'Çift tıklama veya F2 ile tam hücre boyutunda metin giriş kutusu (TextInput) açılır.',
    editorEn: 'Opens an inline full-cell text input on double-click, F2, or direct typing.',
    propsList: [
      { prop: 'align', type: "'left' | 'center' | 'right'", descTr: 'Metin hizalaması (varsayılan: left)', descEn: 'Horizontal text alignment (default: left)' },
      { prop: 'validationRules', type: 'ValidationRule[]', descTr: 'required, stringLength, pattern veya async kuralları', descEn: 'required, stringLength, pattern, or async rules' },
    ],
    sampleColumnDef: {
      id: 'code',
      title: 'Account Code (text)',
      type: 'text',
      width: 180,
      validationRules: [
        { type: 'required', message: 'Account code is required.' },
        { type: 'pattern', pattern: /^ACC-\d{6}$/, message: 'Must match ACC-100001 format.' },
      ],
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', code: 'ACC-100001' },
      { id: 2, company: 'Nexus Cloud', code: 'ACC-100002' },
      { id: 3, company: 'Vertex Labs', code: 'ACC-100003' },
    ],
    code: `{
  id: 'code',
  title: 'Account Code',
  type: 'text',
  width: 150,
  validationRules: [
    { type: 'required', message: 'Account code is required.' },
    { type: 'pattern', pattern: /^ACC-\\d{6}$/, message: 'Must match ACC-100001 format.' },
  ],
}`,
  },
  {
    type: 'email',
    colId: 'email',
    category: 'text',
    categoryLabelTr: 'Metin & İletişim',
    categoryLabelEn: 'Text & Contact',
    titleTr: 'E-Posta Sütunu (Email)',
    titleEn: 'Email Column (email)',
    dataType: 'string',
    sampleValue: '"finance@acmeglobal.io"',
    summaryTr:
      'Kurumsal iletişim e-posta adreslerini zarf ikonu ve vurgulu bağlantı stiliyle gösterir. Yerleşik e-posta doğrulama kuralıyla birlikte çalışır.',
    summaryEn:
      'Renders email addresses with a mail icon and link styling. Pairs seamlessly with the built-in { type: "email" } validation rule.',
    editorTr: 'E-posta doğrulamalı metin düzenleyici açılır.',
    editorEn: 'Opens an inline email input with validation support.',
    propsList: [
      { prop: 'validationRules', type: 'ValidationRule[]', descTr: '{ type: "email" } ile geçersiz e-posta girişini engeller', descEn: 'Use { type: "email" } to block invalid email addresses' },
    ],
    sampleColumnDef: {
      id: 'email',
      title: 'Contact (email)',
      type: 'email',
      width: 210,
      validationRules: [{ type: 'required' }, { type: 'email' }],
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', email: 'finance@acmeglobal.io' },
      { id: 2, company: 'Nexus Cloud', email: 'billing@nexuscloud.io' },
      { id: 3, company: 'Vertex Labs', email: 'ops@vertexlabs.io' },
    ],
    code: `{
  id: 'email',
  title: 'Contact Email',
  type: 'email',
  width: 195,
  validationRules: [
    { type: 'required' },
    { type: 'email', message: 'Please enter a valid corporate email address.' },
  ],
}`,
  },
  {
    type: 'url',
    colId: 'website',
    category: 'text',
    categoryLabelTr: 'Metin & İletişim',
    categoryLabelEn: 'Text & Contact',
    titleTr: 'Web Bağlantısı Sütunu (URL)',
    titleEn: 'Hyperlink / Website Column (url)',
    dataType: 'string',
    sampleValue: '"https://acmeglobal.io"',
    summaryTr:
      'Web sitesi veya döküman bağlantılarını dış bağlantı (↗) ikonuyla gösterir. Sağdaki ↗ ikonuna tıklandığında bağlantıyı yeni sekmede açar, hücre gövdesine çift tıklandığında adresi düzenler.',
    summaryEn:
      'Renders clickable web URLs with an external link (↗) button. Clicking the ↗ icon opens the URL in a new browser tab; double-clicking edits the URL.',
    editorTr: 'URL düzenleme kutusu açılır.',
    editorEn: 'Opens a URL input field on double-click or F2.',
    propsList: [
      { prop: 'validationRules', type: 'ValidationRule[]', descTr: '{ type: "url" } ile http/https format kontrolü yapar', descEn: 'Use { type: "url" } to enforce http:// or https:// URLs' },
    ],
    sampleColumnDef: {
      id: 'website',
      title: 'Website (url)',
      type: 'url',
      width: 195,
      validationRules: [{ type: 'url' }],
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', website: 'https://acmeglobal.io' },
      { id: 2, company: 'Nexus Cloud', website: 'https://nexuscloud.io' },
      { id: 3, company: 'Vertex Labs', website: 'https://vertexlabs.io' },
    ],
    code: `{
  id: 'website',
  title: 'Website (URL)',
  type: 'url',
  width: 180,
  validationRules: [
    { type: 'url', message: 'Website must start with http:// or https://.' },
  ],
}`,
  },
  {
    type: 'phone',
    colId: 'phone',
    category: 'text',
    categoryLabelTr: 'Metin & İletişim',
    categoryLabelEn: 'Text & Contact',
    titleTr: 'Telefon Numarası Sütunu (Phone)',
    titleEn: 'Phone Number Column (phone)',
    dataType: 'string',
    sampleValue: '"+1 (415) 390-2100"',
    summaryTr:
      'Uluslararası veya yerel telefon numaralarını telefon ikonu ve okunaklı tipografiyle gösterir.',
    summaryEn:
      'Renders formatted international or local phone numbers with a handset icon and clean tabular typography.',
    editorTr: 'Telefon numarası düzenleyici açılır.',
    editorEn: 'Opens an inline phone number input editor.',
    propsList: [],
    sampleColumnDef: {
      id: 'phone',
      title: 'Phone (phone)',
      type: 'phone',
      width: 180,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', phone: '+1 (415) 390-2100' },
      { id: 2, company: 'Nexus Cloud', phone: '+44 20 7946 0921' },
      { id: 3, company: 'Vertex Labs', phone: '+90 (212) 555-0199' },
    ],
    code: `{
  id: 'phone',
  title: 'Phone Number',
  type: 'phone',
  width: 165,
}`,
  },
  {
    type: 'color',
    colId: 'tagColor',
    category: 'text',
    categoryLabelTr: 'Metin & İletişim',
    categoryLabelEn: 'Text & Contact',
    titleTr: 'Renk Seçici Sütunu (Color)',
    titleEn: 'Color Swatch & Picker Column (color)',
    dataType: 'string (HEX)',
    sampleValue: '"#38BDF8" | "#10B981"',
    summaryTr:
      'Kategori rengi, marka rengi veya durum etiketi rengini canlı renk kutucuğu (Color Swatch) ve büyük harf HEX koduyla gösterir.',
    summaryEn:
      'Renders a live color swatch preview alongside the uppercase HEX color code inside the cell.',
    editorTr: 'Hazır kurumsal renk paleti + yerel renk seçici + HEX giriş kutusu içeren popover açılır.',
    editorEn: 'Opens a color palette popover with curated enterprise swatches, native color wheel, and HEX input.',
    propsList: [],
    sampleColumnDef: {
      id: 'tagColor',
      title: 'Brand Color (color)',
      type: 'color',
      width: 170,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', tagColor: '#38BDF8' },
      { id: 2, company: 'Nexus Cloud', tagColor: '#10B981' },
      { id: 3, company: 'Vertex Labs', tagColor: '#8B5CF6' },
    ],
    code: `{
  id: 'tagColor',
  title: 'Brand Color',
  type: 'color',
  width: 150,
}`,
  },
];
