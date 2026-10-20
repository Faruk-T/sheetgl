import React, { useState, useMemo, useEffect } from 'react';
import { SheetGL } from './datagrid/ui/SheetGL';
import { SheetGLLogo } from './datagrid/ui/SheetGLLogo';
import { ColumnDef, SelectOption } from './datagrid/types/grid';
import { Deferred } from './datagrid/core/ValidationEngine';

export interface DocsPortalProps {
  isDark: boolean;
  lang: 'tr' | 'en';
  initialSection?: string;
  initialSectionId?: string;
  onSectionChange?: (sectionId: string) => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onNavigateStudio?: () => void;
  onNavigateLanding?: () => void;
  onOpenStudio?: () => void;
  onOpenLanding?: () => void;
}

interface DocSubItem {
  id: string;
  labelTr: string;
  labelEn: string;
  onSelect?: () => void;
}

interface DocSection {
  id: string;
  step: string;
  badgeTr: string;
  badgeEn: string;
  titleTr: string;
  titleEn: string;
  subtitleTr: string;
  subtitleEn: string;
  subItems: DocSubItem[];
  contentTr: React.ReactNode;
  contentEn: React.ReactNode;
}

interface ColumnGuideItem {
  type: string;
  colId: string;
  category: 'text' | 'numeric' | 'choice' | 'structured' | 'visual';
  categoryLabelTr: string;
  categoryLabelEn: string;
  titleTr: string;
  titleEn: string;
  dataType: string;
  sampleValue: string;
  summaryTr: string;
  summaryEn: string;
  editorTr: string;
  editorEn: string;
  propsList: Array<{ prop: string; type: string; descTr: string; descEn: string }>;
  sampleColumnDef: ColumnDef;
  sampleRows: Record<string, any>[];
  code: string;
}

const DOC_STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.16)' },
  { value: 'pending', label: 'Pending', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.16)' },
  { value: 'rejected', label: 'Rejected', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.16)' },
];

const DOC_CITY_OPTIONS: SelectOption[] = [
  { value: 'Istanbul', label: 'Istanbul', icon: '🌉', subtitle: 'EMEA Hub • 20% Tax' },
  { value: 'London', label: 'London', icon: '🇬🇧', subtitle: 'Europe • 15% Tax' },
  { value: 'New York', label: 'New York', icon: '🗽', subtitle: 'Americas • 10% Tax' },
  { value: 'Tokyo', label: 'Tokyo', icon: '🗼', subtitle: 'APAC • 12% Tax' },
];

const DOC_TAGS_OPTIONS: SelectOption[] = [
  { value: 'SOC2', label: 'SOC2 Type II', color: '#38BDF8', bgColor: 'rgba(56, 189, 248, 0.16)' },
  { value: 'GDPR', label: 'EU GDPR', color: '#A855F7', bgColor: 'rgba(168, 85, 247, 0.16)' },
  { value: 'ISO27001', label: 'ISO 27001', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.16)' },
  { value: 'HIPAA', label: 'HIPAA', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.16)' },
];

const DOC_LOOKUP_OPTIONS: SelectOption[] = [
  { value: 'MGR-01', label: 'Elena Rostova', subtitle: 'VP of Enterprise Sales • EMEA', color: '#38BDF8' },
  { value: 'MGR-02', label: 'Marcus Vance', subtitle: 'Managing Director • Americas', color: '#8B5CF6' },
  { value: 'MGR-03', label: 'Kenji Takahashi', subtitle: 'Head of FinTech • APAC', color: '#10B981' },
];

const COLUMN_GUIDES: ColumnGuideItem[] = [
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
    type: 'number',
    colId: 'quantity',
    category: 'numeric',
    categoryLabelTr: 'Sayısal & Finansal',
    categoryLabelEn: 'Numeric & Financial',
    titleTr: 'Sayısal Sütun (Number)',
    titleEn: 'Number Column (number)',
    dataType: 'number',
    sampleValue: '1042 | 98.45',
    summaryTr:
      'Tam sayı (ID, adet, miktar) veya ondalıklı sayısal değerler için kullanılır. Binlik ayırıcı ve ondalık basamak sayısı (decimalDigits) yerel dile (TR/EN) göre biçimlendirilir.',
    summaryEn:
      'Renders integers (IDs, quantities) or floating-point numbers with locale-aware thousand separators and configurable decimal precision.',
    editorTr: 'Sayısal giriş kutusu açılır; negatif ve ondalık giriş desteklenir.',
    editorEn: 'Inline numeric editor supporting negative signs, decimals, and Enter/Tab commit.',
    propsList: [
      { prop: 'decimalDigits', type: 'number', descTr: 'Ondalık basamak sayısı (ID için 0, kesirli sayı için 2 vb.)', descEn: 'Number of decimal places (0 for integer IDs, 2 for decimals)' },
      { prop: 'summaryType', type: "'sum' | 'avg' | 'min' | 'max' | 'count'", descTr: 'Alt özet satırında uygulanacak hesaplama', descEn: 'Footer aggregation formula' },
    ],
    sampleColumnDef: {
      id: 'quantity',
      title: 'Order Qty (number)',
      type: 'number',
      width: 170,
      decimalDigits: 0,
      summaryType: 'sum',
      validationRules: [{ type: 'range', min: 1, max: 10000 }],
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', quantity: 250 },
      { id: 2, company: 'Nexus Cloud', quantity: 1420 },
      { id: 3, company: 'Vertex Labs', quantity: 85 },
    ],
    code: `{
  id: 'quantity',
  title: 'Order Quantity',
  type: 'number',
  width: 140,
  decimalDigits: 0, // Integer formatting (no decimals)
  summaryType: 'sum',
  validationRules: [
    { type: 'range', min: 1, max: 10000, message: 'Quantity must be between 1 and 10,000.' },
  ],
}`,
  },
  {
    type: 'currency',
    colId: 'balance',
    category: 'numeric',
    categoryLabelTr: 'Sayısal & Finansal',
    categoryLabelEn: 'Numeric & Financial',
    titleTr: 'Para Birimi Sütunu (Currency)',
    titleEn: 'Currency Column (currency)',
    dataType: 'number',
    sampleValue: '65420.50 → "$65,420.50"',
    summaryTr:
      'Finansal bakiye, tutar, fiyat ve maliyet sütunları için kullanılır. Para birimi sembolü, binlik ayırıcılar ve negatif tutar gösterimi otomatik uygulanır.',
    summaryEn:
      'Formatted monetary column with customizable currency symbol, thousand separators, right alignment, and footer sum/average aggregation.',
    editorTr: 'Para birimi sembollü sayısal düzenleyici açılır; "$12,500.50" gibi yapıştırılan metinleri otomatik sayıya çevirir.',
    editorEn: 'Numeric input with currency prefix; automatically strips symbols/commas when pasting from Excel.',
    propsList: [
      { prop: 'currencySymbol', type: 'string', descTr: 'Para birimi sembolü (ör. "$", "₺", "€", "£")', descEn: 'Currency symbol prefix (e.g. "$", "₺", "€", "£")' },
      { prop: 'decimalDigits', type: 'number', descTr: 'Kuruş/ondalık basamak sayısı (varsayılan: 2)', descEn: 'Decimal precision (default: 2)' },
      { prop: 'summaryType', type: "'sum' | 'avg' | 'min' | 'max'", descTr: 'Alt toplam satırı tipi', descEn: 'Summary footer aggregation type' },
    ],
    sampleColumnDef: {
      id: 'balance',
      title: 'Gross Balance (currency)',
      type: 'currency',
      width: 190,
      currencySymbol: '$',
      decimalDigits: 2,
      summaryType: 'sum',
      validationRules: [{ type: 'range', min: 0, max: 10000000 }],
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', balance: 65420.5 },
      { id: 2, company: 'Nexus Cloud', balance: 128900.0 },
      { id: 3, company: 'Vertex Labs', balance: 42150.75 },
    ],
    code: `{
  id: 'balance',
  title: 'Gross Balance ($)',
  type: 'currency',
  width: 160,
  currencySymbol: '$',
  decimalDigits: 2,
  summaryType: 'sum',
  validationRules: [
    { type: 'required' },
    { type: 'range', min: 0, max: 10000000, message: 'Balance cannot be negative.' },
  ],
}`,
  },
  {
    type: 'percent',
    colId: 'yoyGrowth',
    category: 'numeric',
    categoryLabelTr: 'Sayısal & Finansal',
    categoryLabelEn: 'Numeric & Financial',
    titleTr: 'Yüzde & Varyans Sütunu (Percent)',
    titleEn: 'Percentage & Variance Column (percent)',
    dataType: 'number',
    sampleValue: '18.4 → "+18.4%" | -6.2 → "-6.2%"',
    summaryTr:
      'Büyüme oranı (YoY Growth), kâr marjı, iskonto veya değişim yüzdesi için kullanılır. Pozitif değerleri yeşil (+), negatif değerleri kırmızı (-) rozet olarak renklendirebilir.',
    summaryEn:
      'Displays percentage metrics and financial KPI variances. When showVarianceSign is enabled, renders positive values in emerald (+18.4%) and negative values in red (-6.2%).',
    editorTr: 'Sağında "%" göstergesi bulunan sayısal düzenleyici açılır.',
    editorEn: 'Opens a numeric input with a trailing "%" indicator.',
    propsList: [
      { prop: 'decimalDigits', type: 'number', descTr: 'Ondalık basamak sayısı (varsayılan: 1)', descEn: 'Decimal precision (default: 1)' },
      { prop: 'showVarianceSign', type: 'boolean', descTr: 'Pozitif değerlere "+" işareti ve yeşil/kırmızı varyans rengi verir', descEn: 'Prefixes "+" on positive numbers and applies green/red semantic coloring' },
    ],
    sampleColumnDef: {
      id: 'yoyGrowth',
      title: 'YoY Growth (percent)',
      type: 'percent',
      width: 180,
      decimalDigits: 1,
      showVarianceSign: true,
      summaryType: 'avg',
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', yoyGrowth: 18.4 },
      { id: 2, company: 'Nexus Cloud', yoyGrowth: -6.2 },
      { id: 3, company: 'Vertex Labs', yoyGrowth: 24.9 },
    ],
    code: `{
  id: 'yoyGrowth',
  title: 'YoY Growth (%)',
  type: 'percent',
  width: 150,
  decimalDigits: 1,
  showVarianceSign: true,
  summaryType: 'avg',
}`,
  },
  {
    type: 'boolean',
    colId: 'isApproved',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Onay Kutusu Sütunu (Boolean)',
    titleEn: 'Checkbox Column (boolean)',
    dataType: 'boolean',
    sampleValue: 'true | false',
    summaryTr:
      'Onay durumu, aktif/pasif bayrağı veya ikili (evet/hayır) alanlar için kullanılır. Düzenleyici açmaya gerek kalmadan tek tıklama ile değeri değiştirir.',
    summaryEn:
      'Renders an interactive vector checkbox directly on the HTML5 Canvas. Clicking the checkbox toggles the value immediately without opening a DOM overlay.',
    editorTr: 'Hücre içindeki onay kutusuna tek tıklama veya Space/Enter tuşu ile anında değişir.',
    editorEn: 'Single-click directly on the canvas checkbox or press Space/Enter to toggle.',
    propsList: [
      { prop: 'canEdit', type: '(row, col) => boolean', descTr: 'Satır bazlı kilit kontrolü', descEn: 'Row-level conditional lock' },
    ],
    sampleColumnDef: {
      id: 'isApproved',
      title: 'Approved (boolean)',
      type: 'boolean',
      width: 160,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', isApproved: true },
      { id: 2, company: 'Nexus Cloud', isApproved: false },
      { id: 3, company: 'Vertex Labs', isApproved: true },
    ],
    code: `{
  id: 'isApproved',
  title: 'Approved',
  type: 'boolean',
  width: 110,
  sortable: true,
  filterable: true,
}`,
  },
  {
    type: 'select',
    colId: 'status',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Durum Rozeti Sütunu (Select)',
    titleEn: 'Status Badge Select Column (select)',
    dataType: 'string',
    sampleValue: '"active" | "pending" | "rejected"',
    summaryTr:
      'Renkli durum rozetleri (Status Pill) göstermek ve açılır listeden tekli seçim yapmak için kullanılır. Her seçeneğe özel arka plan ve metin rengi atanabilir.',
    summaryEn:
      'Renders a rounded status pill badge with custom background/text colors and a chevron indicator. Ideal for workflow states like Active, Pending, or Rejected.',
    editorTr: 'Hücreye tıklandığında veya çift tıklandığında renkli rozetli açılır menü (Popover) açılır.',
    editorEn: 'Opens a themed popover menu displaying colored status pills and keyboard navigation.',
    propsList: [
      { prop: 'options', type: 'SelectOption[]', descTr: '{ value, label, color, bgColor } dizisi', descEn: 'Array of { value, label, color, bgColor } items' },
    ],
    sampleColumnDef: {
      id: 'status',
      title: 'Status (select)',
      type: 'select',
      width: 170,
      options: DOC_STATUS_OPTIONS,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', status: 'active' },
      { id: 2, company: 'Nexus Cloud', status: 'pending' },
      { id: 3, company: 'Vertex Labs', status: 'rejected' },
    ],
    code: `{
  id: 'status',
  title: 'Account Status',
  type: 'select',
  width: 150,
  options: [
    { value: 'active', label: 'Active', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.16)' },
    { value: 'pending', label: 'Pending', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.16)' },
    { value: 'rejected', label: 'Rejected', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.16)' },
  ],
}`,
  },
  {
    type: 'dropdown',
    colId: 'city',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Aranabilir Açılır Liste (Dropdown)',
    titleEn: 'Searchable Dropdown Column (dropdown)',
    dataType: 'string',
    sampleValue: '"Istanbul" | "London" | "New York"',
    summaryTr:
      'İkon, başlık ve alt açıklama (subtitle) içeren zengin seçenek listeleri için kullanılır. Açılır pencerede anlık arama (Search) yapılabilir.',
    summaryEn:
      'Rich single-select combobox supporting option icons, primary labels, subtitles, and instant type-to-filter search inside the popover.',
    editorTr: 'Arama çubuklu, ikonlu ve alt başlıklı açılır liste penceresi açılır.',
    editorEn: 'Opens a searchable dropdown popover with icon, label, and subtitle rows.',
    propsList: [
      { prop: 'options', type: 'SelectOption[]', descTr: '{ value, label, icon?, subtitle? } dizisi', descEn: 'Array of { value, label, icon?, subtitle? } options' },
      { prop: 'setCellValue', type: 'function', descTr: 'Seçim değiştiğinde diğer sütunları otomatik güncelleme', descEn: 'Cascading callback when selection changes' },
    ],
    sampleColumnDef: {
      id: 'city',
      title: 'Region / City (dropdown)',
      type: 'dropdown',
      width: 195,
      options: DOC_CITY_OPTIONS,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', city: 'Istanbul' },
      { id: 2, company: 'Nexus Cloud', city: 'London' },
      { id: 3, company: 'Vertex Labs', city: 'New York' },
    ],
    code: `{
  id: 'city',
  title: 'Region / City',
  type: 'dropdown',
  width: 180,
  options: [
    { value: 'Istanbul', label: 'Istanbul', icon: '🌉', subtitle: 'EMEA Hub • 20% Tax' },
    { value: 'London', label: 'London', icon: '🇬🇧', subtitle: 'Europe • 15% Tax' },
    { value: 'New York', label: 'New York', icon: '🗽', subtitle: 'Americas • 10% Tax' },
  ],
}`,
  },
  {
    type: 'multiselect',
    colId: 'tags',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Çoklu Seçim Etiket Sütunu (Multi-Select)',
    titleEn: 'Multi-Select Tag Chips Column (multiselect)',
    dataType: 'string[]',
    sampleValue: '["SOC2", "GDPR", "ISO27001"]',
    summaryTr:
      'Bir hücrede birden fazla etiket, sertifika veya kategori seçmek için kullanılır. Hücre içinde yan yana renkli rozetler (Tag Chips) olarak çizilir.',
    summaryEn:
      'Stores an array of selected option values and renders multiple colored tag chips inside the cell (with "+N" overflow counter when space is tight).',
    editorTr: 'Onay kutulu (Checkbox), tümünü seç/temizle butonlu ve arama destekli çoklu seçim penceresi açılır.',
    editorEn: 'Opens a searchable multi-checkbox popover with Select All / Clear buttons.',
    propsList: [
      { prop: 'options', type: 'SelectOption[]', descTr: 'Seçilebilir etiketlerin { value, label, color, bgColor } listesi', descEn: 'Available tag options { value, label, color, bgColor }' },
    ],
    sampleColumnDef: {
      id: 'tags',
      title: 'Compliance (multiselect)',
      type: 'multiselect',
      width: 230,
      options: DOC_TAGS_OPTIONS,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', tags: ['SOC2', 'GDPR'] },
      { id: 2, company: 'Nexus Cloud', tags: ['ISO27001', 'SOC2', 'HIPAA'] },
      { id: 3, company: 'Vertex Labs', tags: ['GDPR'] },
    ],
    code: `{
  id: 'tags',
  title: 'Compliance Standards',
  type: 'multiselect',
  width: 220,
  options: [
    { value: 'SOC2', label: 'SOC2 Type II', color: '#38BDF8', bgColor: 'rgba(56, 189, 248, 0.16)' },
    { value: 'GDPR', label: 'EU GDPR', color: '#A855F7', bgColor: 'rgba(168, 85, 247, 0.16)' },
    { value: 'ISO27001', label: 'ISO 27001', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.16)' },
  ],
}`,
  },
  {
    type: 'lookup',
    colId: 'managerId',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'İlişkisel Kayıt Arama Sütunu (Lookup)',
    titleEn: 'Relational Foreign-Key Lookup (lookup)',
    dataType: 'string | number',
    sampleValue: '"MGR-01" (Görünen: "Elena Rostova")',
    summaryTr:
      'Veritabanındaki Foreign Key ID değerini ("MGR-01") tutup ekranda ilişkili kaydın adını, baş harf avatarını ve unvanını göstermek için kullanılır.',
    summaryEn:
      'Maps foreign-key IDs (e.g. "MGR-01") to human-readable display records with an initials avatar badge, full name, and role subtitle.',
    editorTr: 'ID, isim veya unvana göre aranabilen ilişkisel kayıt seçici penceresi açılır.',
    editorEn: 'Opens a relational record picker searchable by ID, display label, or subtitle.',
    propsList: [
      { prop: 'options', type: 'SelectOption[]', descTr: '{ value: ID, label: Ad, subtitle: Unvan, color } dizisi', descEn: 'Array of foreign-key records { value, label, subtitle, color }' },
    ],
    sampleColumnDef: {
      id: 'managerId',
      title: 'Manager (lookup)',
      type: 'lookup',
      width: 230,
      options: DOC_LOOKUP_OPTIONS,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', managerId: 'MGR-01' },
      { id: 2, company: 'Nexus Cloud', managerId: 'MGR-02' },
      { id: 3, company: 'Vertex Labs', managerId: 'MGR-03' },
    ],
    code: `{
  id: 'managerId',
  title: 'Account Manager',
  type: 'lookup',
  width: 220,
  options: [
    { value: 'MGR-01', label: 'Elena Rostova', subtitle: 'VP of Enterprise Sales • EMEA', color: '#38BDF8' },
    { value: 'MGR-02', label: 'Marcus Vance', subtitle: 'Managing Director • Americas', color: '#8B5CF6' },
  ],
}`,
  },
  {
    type: 'object',
    colId: 'metadata',
    category: 'structured',
    categoryLabelTr: 'Yapısal & Tarih/Saat',
    categoryLabelEn: 'Structured & Date/Time',
    titleTr: 'Nesne & JSON Sütunu (Object)',
    titleEn: 'Structured Object / JSON Column (object)',
    dataType: 'Record<string, any>',
    sampleValue: '{ tier: "Enterprise", sla: "99.99%", costCenter: "CC-204" }',
    summaryTr:
      'Hücre içinde iç içe JavaScript nesnesi (Object / JSON) tutmak için kullanılır. Hücrede "{ } tier: Enterprise • +2" şeklinde özet rozet ve anahtar-değer çiftlerini gösterir.',
    summaryEn:
      'Natively binds nested JavaScript objects or JSON payloads. Renders a "{ }" badge, primary key-value pill, and property summary right inside the canvas cell.',
    editorTr: 'Çift modlu (Görsel Key-Value satır düzenleyici + canlı doğrulamalı Raw JSON kod editörü) popover açılır.',
    editorEn: 'Opens a dual-mode popover editor with Visual Key-Value Builder and Raw JSON editor tabs.',
    propsList: [
      { prop: 'objectDisplayKey', type: 'string', descTr: 'Hücrede ilk sırada öne çıkarılacak anahtar adı (ör. "tier")', descEn: 'Primary object property key to highlight first in the cell' },
    ],
    sampleColumnDef: {
      id: 'metadata',
      title: 'Metadata (object / JSON)',
      type: 'object',
      width: 260,
      objectDisplayKey: 'tier',
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', metadata: { tier: 'Enterprise', sla: '99.99%', costCenter: 'CC-201' } },
      { id: 2, company: 'Nexus Cloud', metadata: { tier: 'Strategic', sla: '99.95%', costCenter: 'CC-202' } },
      { id: 3, company: 'Vertex Labs', metadata: { tier: 'Growth', sla: '99.90%', costCenter: 'CC-203' } },
    ],
    code: `{
  id: 'metadata',
  title: 'Metadata (Object / JSON)',
  type: 'object',
  width: 250,
  objectDisplayKey: 'tier', // Highlights metadata.tier first in the cell
}`,
  },
  {
    type: 'date',
    colId: 'date',
    category: 'structured',
    categoryLabelTr: 'Yapısal & Tarih/Saat',
    categoryLabelEn: 'Structured & Date/Time',
    titleTr: 'Tarih Sütunu (Date)',
    titleEn: 'Date Column (date)',
    dataType: 'string (ISO YYYY-MM-DD)',
    sampleValue: '"2025-05-14"',
    summaryTr:
      'Yıl-Ay-Gün formatındaki tarih verilerini yerel dile uygun (TR: 14.05.2025, EN: May 14, 2025) takvim ikonuyla gösterir.',
    summaryEn:
      'Renders ISO date strings ("YYYY-MM-DD") with a calendar icon and locale-aware date formatting.',
    editorTr: 'Aylık/yıllık gezinmeli, "Bugün" ve "Temizle" butonlu interaktif takvim (DatePicker) açılır.',
    editorEn: 'Opens an interactive monthly calendar popover with Today/Clear shortcuts.',
    propsList: [],
    sampleColumnDef: {
      id: 'date',
      title: 'Registered (date)',
      type: 'date',
      width: 170,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', date: '2025-05-14' },
      { id: 2, company: 'Nexus Cloud', date: '2025-06-22' },
      { id: 3, company: 'Vertex Labs', date: '2025-08-09' },
    ],
    code: `{
  id: 'date',
  title: 'Registered Date',
  type: 'date',
  width: 150,
  sortable: true,
  filterable: true,
}`,
  },
  {
    type: 'datetime',
    colId: 'lastAuditAt',
    category: 'structured',
    categoryLabelTr: 'Yapısal & Tarih/Saat',
    categoryLabelEn: 'Structured & Date/Time',
    titleTr: 'Tarih ve Saat Sütunu (DateTime)',
    titleEn: 'Date & Time Column (datetime)',
    dataType: 'string (YYYY-MM-DD HH:mm)',
    sampleValue: '"2025-05-14 14:30"',
    summaryTr:
      'Denetim zamanı (Audit Timestamp), işlem anı veya randevu tarihi gibi hem gün hem saat/dakika içeren veriler için kullanılır.',
    summaryEn:
      'Displays combined date and 24-hour time stamps ("YYYY-MM-DD HH:mm") with a distinct clock-badge highlight.',
    editorTr: 'Takvim seçici ile birlikte Saat (00-23) ve Dakika (00-59) seçici tekerlekleri içeren birleşik pencere açılır.',
    editorEn: 'Opens a unified Calendar + Hour/Minute time selector popover.',
    propsList: [],
    sampleColumnDef: {
      id: 'lastAuditAt',
      title: 'Last Audit (datetime)',
      type: 'datetime',
      width: 200,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', lastAuditAt: '2025-05-14 14:30' },
      { id: 2, company: 'Nexus Cloud', lastAuditAt: '2025-06-22 09:15' },
      { id: 3, company: 'Vertex Labs', lastAuditAt: '2025-08-09 17:45' },
    ],
    code: `{
  id: 'lastAuditAt',
  title: 'Last Audit (DateTime)',
  type: 'datetime',
  width: 185,
  sortable: true,
  filterable: true,
}`,
  },
  {
    type: 'time',
    colId: 'cutoffTime',
    category: 'structured',
    categoryLabelTr: 'Yapısal & Tarih/Saat',
    categoryLabelEn: 'Structured & Date/Time',
    titleTr: 'Saat Sütunu (Time)',
    titleEn: 'Time Column (time)',
    dataType: 'string (HH:mm)',
    sampleValue: '"09:30" | "17:45"',
    summaryTr:
      'Vardiya saati, son işlem saati (Cut-off Time) veya günlük periyodik saat bilgileri için kullanılır.',
    summaryEn:
      'Renders 24-hour time values ("HH:mm") with a clock icon for shift schedules or daily cut-off times.',
    editorTr: 'Hızlı saat dilimi (08:30, 09:00, 14:00 vb.) ve Saat/Dakika seçici penceresi açılır.',
    editorEn: 'Opens a quick-slot time picker with custom hour and minute selectors.',
    propsList: [],
    sampleColumnDef: {
      id: 'cutoffTime',
      title: 'Cut-off (time)',
      type: 'time',
      width: 155,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', cutoffTime: '09:30' },
      { id: 2, company: 'Nexus Cloud', cutoffTime: '14:00' },
      { id: 3, company: 'Vertex Labs', cutoffTime: '17:45' },
    ],
    code: `{
  id: 'cutoffTime',
  title: 'Cut-off Time',
  type: 'time',
  width: 140,
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
  {
    type: 'progress',
    colId: 'progress',
    category: 'numeric',
    categoryLabelTr: 'Sayısal & Finansal',
    categoryLabelEn: 'Numeric & Financial',
    titleTr: 'İlerleme Çubuğu Sütunu (Progress)',
    titleEn: 'Progress Bar Column (progress)',
    dataType: 'number (0 - 100)',
    sampleValue: '75 → [███████░░] 75%',
    summaryTr:
      '0 ile 100 arasındaki tamamlanma oranı, kota gerçekleşmesi veya vergi oranını hücre içinde renkli ilerleme çubuğu (Progress Bar) ve yüzde değeriyle gösterir.',
    summaryEn:
      'Renders a smooth horizontal progress bar (0–100%) with dynamic color thresholds and percentage label.',
    editorTr: 'Kaydırma çubuğu (Slider) ve sayısal yüzde giriş kutusu açılır.',
    editorEn: 'Opens an interactive slider and numeric percentage editor.',
    propsList: [
      { prop: 'summaryType', type: "'avg' | 'min' | 'max'", descTr: 'Özet satırında ortalama ilerleme yüzdesi gösterimi', descEn: 'Footer summary aggregation (typically avg)' },
    ],
    sampleColumnDef: {
      id: 'progress',
      title: 'Target Quota (progress)',
      type: 'progress',
      width: 185,
      summaryType: 'avg',
      validationRules: [{ type: 'range', min: 0, max: 100 }],
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', progress: 85 },
      { id: 2, company: 'Nexus Cloud', progress: 62 },
      { id: 3, company: 'Vertex Labs', progress: 94 },
    ],
    code: `{
  id: 'progress',
  title: 'Target Quota (%)',
  type: 'progress',
  width: 150,
  summaryType: 'avg',
  validationRules: [
    { type: 'range', min: 0, max: 100 },
  ],
}`,
  },
  {
    type: 'rating',
    colId: 'rating',
    category: 'visual',
    categoryLabelTr: 'Görsel & Etkileşimli',
    categoryLabelEn: 'Visual & Interactive',
    titleTr: 'Yıldız Derecelendirme Sütunu (Rating)',
    titleEn: 'Star Rating Column (rating)',
    dataType: 'number (1 - 5)',
    sampleValue: '4 → "★★★★☆"',
    summaryTr:
      '1 ile 5 arasındaki kalite puanı, tedarikçi güven skoru veya müşteri memnuniyetini altın yıldızlarla gösterir. Hücre üzerindeki yıldızlara doğrudan tıklanarak puan değiştirilebilir.',
    summaryEn:
      'Renders 1-to-5 interactive star ratings on the canvas. Users can click directly on a star inside the cell to update the rating immediately.',
    editorTr: 'Hücre içindeki yıldıza doğrudan tıklama veya F2 ile yıldız seçici.',
    editorEn: 'Direct canvas click on any star position (1–5) or inline star selector.',
    propsList: [
      { prop: 'summaryType', type: "'avg'", descTr: 'Alt özet satırında ortalama puanı hesaplar', descEn: 'Computes average rating in the summary footer' },
    ],
    sampleColumnDef: {
      id: 'rating',
      title: 'Trust Score (rating)',
      type: 'rating',
      width: 175,
      summaryType: 'avg',
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', rating: 5 },
      { id: 2, company: 'Nexus Cloud', rating: 4 },
      { id: 3, company: 'Vertex Labs', rating: 3 },
    ],
    code: `{
  id: 'rating',
  title: 'Trust Score',
  type: 'rating',
  width: 140,
  summaryType: 'avg',
}`,
  },
  {
    type: 'sparkline',
    colId: 'sparkline',
    category: 'visual',
    categoryLabelTr: 'Görsel & Etkileşimli',
    categoryLabelEn: 'Visual & Interactive',
    titleTr: 'Mini Trend Grafiği Sütunu (Sparkline)',
    titleEn: 'Mini Trend Chart Column (sparkline)',
    dataType: 'number[]',
    sampleValue: '[25, 40, 35, 60, 55, 75, 85]',
    summaryTr:
      'Sayı dizisini hücre içinde 60 FPS hızında yumuşak dolgulu çizgi grafik (Area Sparkline) olarak çizer. Sağ üstteki büyüteç ikonuna veya hücreye çift tıklandığında detaylı interaktif grafik modalı açılır.',
    summaryEn:
      'Renders an array of numbers as a smooth canvas area-line chart inside the cell. Clicking the expand icon or double-clicking opens the full-screen interactive Trend Analytics Modal.',
    editorTr: 'Salt-görsel analitik sütundur; tıklandığında Detaylı Trend Analiz Modalı açar.',
    editorEn: 'Read-only visual analytics column; clicking opens the Detailed Trend Analytics Modal.',
    propsList: [
      { prop: 'sparklineColor', type: 'string', descTr: 'Grafik çizgi ve gradyan rengi (ör. "#38BDF8")', descEn: 'Stroke and gradient fill color (e.g. "#38BDF8")' },
    ],
    sampleColumnDef: {
      id: 'sparkline',
      title: '7-Day Trend (sparkline)',
      type: 'sparkline',
      width: 185,
      sparklineColor: '#38BDF8',
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', sparkline: [25, 40, 35, 60, 55, 75, 90] },
      { id: 2, company: 'Nexus Cloud', sparkline: [80, 70, 65, 50, 58, 45, 40] },
      { id: 3, company: 'Vertex Labs', sparkline: [15, 30, 45, 52, 68, 82, 95] },
    ],
    code: `{
  id: 'sparkline',
  title: '7-Day Trend',
  type: 'sparkline',
  width: 150,
  sparklineColor: '#38BDF8',
}`,
  },
  {
    type: 'action',
    colId: 'actions',
    category: 'visual',
    categoryLabelTr: 'Görsel & Etkileşimli',
    categoryLabelEn: 'Visual & Interactive',
    titleTr: 'Eylem Butonu Sütunu (Action)',
    titleEn: 'Interactive Row Action Button (action)',
    dataType: 'void (Callback)',
    sampleValue: 'onActionClick(row, rowIndex)',
    summaryTr:
      'Her satırın sonunda "İncele", "Detay", "Fatura PDF" veya "Onayla" gibi tıklanabilir bir buton çizer. Tablo Salt-Okunur (Read-Only) modda olsa bile çalışmaya devam eder.',
    summaryEn:
      'Renders a styled interactive button inside every row. Clicking triggers onActionClick(rowData, rowIndex) even when the grid is in Read-Only mode.',
    editorTr: 'Butona tıklandığında doğrudan onActionClick fonksiyonunu tetikler.',
    editorEn: 'Triggers onActionClick(rowData, rowIndex) immediately on pointer down.',
    propsList: [
      { prop: 'buttonText', type: 'string', descTr: 'Buton üzerinde yazacak metin (ör. "İncele" / "Inspect")', descEn: 'Button label text (e.g. "Inspect" / "Details")' },
      { prop: 'onActionClick', type: '(row, rowIndex) => void', descTr: 'Butona tıklandığında satır verisiyle çağrılan fonksiyon', descEn: 'Callback invoked with the clicked row data and index' },
    ],
    sampleColumnDef: {
      id: 'actions',
      title: 'Action (action)',
      type: 'action',
      width: 140,
      buttonText: 'Inspect',
      onActionClick: (row) => {
        window.alert(`Row #${row.id} (${row.company}) action triggered!`);
      },
    },
    sampleRows: [
      { id: 1, company: 'Acme Global' },
      { id: 2, company: 'Nexus Cloud' },
      { id: 3, company: 'Vertex Labs' },
    ],
    code: `{
  id: 'actions',
  title: 'Actions',
  type: 'action',
  width: 110,
  buttonText: 'Inspect',
  onActionClick: (row, rowIndex) => {
    console.log('Inspecting row:', rowIndex, row);
  },
}`,
  },
];

// Lightweight IDE syntax highlighter
function renderHighlightedLine(line: string, isDark: boolean): React.ReactNode {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
    return <span style={{ color: isDark ? '#64748B' : '#64748B', fontStyle: 'italic' }}>{line}</span>;
  }

  const tokenRegex =
    /(\/\/.*$|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\b(?:import|from|export|default|const|let|var|function|return|async|await|if|else|true|false|null|undefined|new|type|interface)\b|\b(?:SheetGL|ColumnDef|LocalDataStore|RemoteDataStore|ValidationEngine|Deferred|createDeferred|ColumnTypeRegistry|ThemeEngine|LocaleEngine|Promise)\b|\b\d+(?:\.\d+)?\b)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const token = match[0];
    let color = isDark ? '#E2E8F0' : '#0F172A';
    let weight: number | undefined = undefined;

    if (token.startsWith('//')) {
      color = '#64748B';
    } else if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
      color = isDark ? '#34D399' : '#059669';
    } else if (
      /^(import|from|export|default|const|let|var|function|return|async|await|if|else|new|type|interface)$/.test(
        token
      )
    ) {
      color = isDark ? '#C084FC' : '#7C3AED';
      weight = 600;
    } else if (/^(true|false|null|undefined)$/.test(token)) {
      color = isDark ? '#F472B6' : '#DB2777';
      weight = 600;
    } else if (
      /^(SheetGL|ColumnDef|LocalDataStore|RemoteDataStore|ValidationEngine|Deferred|createDeferred|ColumnTypeRegistry|ThemeEngine|LocaleEngine|Promise)$/.test(
        token
      )
    ) {
      color = isDark ? '#38BDF8' : '#0284C7';
      weight = 600;
    } else if (/^\d/.test(token)) {
      color = isDark ? '#FBBF24' : '#D97706';
    }

    parts.push(
      <span key={match.index} style={{ color, fontWeight: weight }}>
        {token}
      </span>
    );
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line || ' ';
}

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
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [colCategoryFilter, setColCategoryFilter] = useState<
    'all' | 'text' | 'numeric' | 'choice' | 'structured' | 'visual'
  >('all');
  const [colSearch, setColSearch] = useState<string>('');
  const [activeLiveColType, setActiveLiveColType] = useState<string | null>(null);
  const [permModeDemo, setPermModeDemo] = useState<'write' | 'readonly'>('write');
  const [cascadeLogs, setCascadeLogs] = useState<string[]>([]);

  useEffect(() => {
    const nextSec = initialSectionId || initialSection;
    if (nextSec && nextSec !== activeSectionId) {
      setActiveSectionId(nextSec);
      setExpandedSections((prev) => ({ ...prev, [nextSec]: true }));
    }
  }, [initialSection, initialSectionId]);

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    setActiveSubId('');
    setExpandedSections((prev) => ({ ...prev, [id]: true }));
    onSectionChange?.(id);
    const mainEl = document.getElementById('docs-main-scroll');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
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

  const colors = {
    bg: isDark ? '#0B0F19' : '#F8FAFC',
    sidebarBg: isDark ? '#070A12' : '#FFFFFF',
    surface: isDark ? '#111827' : '#FFFFFF',
    surfaceAlt: isDark ? '#1E293B' : '#F1F5F9',
    border: isDark ? '#1F2937' : '#E2E8F0',
    text: isDark ? '#F9FAFB' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#475569',
    accent: isDark ? '#38BDF8' : '#0284C7',
    accentBg: isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.1)',
    codeBg: isDark ? '#070B14' : '#0F172A',
    codeHeaderBg: isDark ? '#111827' : '#1E293B',
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId((prev) => (prev === id ? null : prev)), 1600);
  };

  // Reusable Live Interactive Example Box
  const LiveDemoBox: React.FC<{
    title: string;
    subtitle?: string;
    hints?: string[];
    height?: number;
    data: any[];
    columns: ColumnDef[];
    showToolbar?: boolean;
    showFormulaBar?: boolean;
    showGroupPanel?: boolean;
    showSummaryFooter?: boolean;
    initialGroups?: { selector: string }[];
    permissions?: any;
  }> = ({
    title,
    subtitle,
    hints,
    height = 290,
    data,
    columns: demoCols,
    showToolbar = false,
    showFormulaBar = true,
    showGroupPanel = false,
    showSummaryFooter = true,
    initialGroups = [],
    permissions,
  }) => {
    const [resetKey, setResetKey] = useState<number>(0);
    const clonedData = useMemo(
      () => JSON.parse(JSON.stringify(data)),
      [data, resetKey]
    );

    return (
      <div
        style={{
          margin: '18px 0 24px',
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${colors.accent}`,
          backgroundColor: colors.surface,
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.45)'
            : '0 8px 24px rgba(2, 132, 199, 0.08)',
        }}
      >
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: colors.surfaceAlt,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '2px 8px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(16, 185, 129, 0.16)',
                  color: '#10B981',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ● {isTR ? 'CANLI İNTERAKTİF ÖRNEK' : 'LIVE INTERACTIVE EXAMPLE'}
              </span>
              <span style={{ fontWeight: 800, fontSize: 14.5, color: colors.text }}>{title}</span>
            </div>
            {subtitle && (
              <div style={{ fontSize: 12.5, color: colors.muted, marginTop: 4 }}>{subtitle}</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setResetKey((k) => k + 1)}
            style={{
              padding: '5px 11px',
              borderRadius: 6,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ↺ {isTR ? 'Örneği Sıfırla' : 'Reset Demo'}
          </button>
        </div>

        {hints && hints.length > 0 && (
          <div
            style={{
              padding: '8px 18px',
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.07)' : 'rgba(2, 132, 199, 0.05)',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              fontSize: 12.5,
              color: colors.text,
            }}
          >
            <strong style={{ color: colors.accent }}>
              {isTR ? 'Deneyin:' : 'Try it live:'}
            </strong>
            {hints.map((h, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 8px',
                  borderRadius: 6,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  fontSize: 12,
                }}
              >
                {h}
              </span>
            ))}
          </div>
        )}

        <div style={{ width: '100%', height }}>
          <SheetGL
            key={`${resetKey}_${lang}_${isDark}`}
            dataSource={clonedData}
            columns={demoCols}
            theme={isDark ? 'apple-dark' : 'apple-light'}
            locale={isTR ? 'tr-TR' : 'en-US'}
            initialGroups={initialGroups}
            permissions={permissions}
            batchEditMode={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  };

  const CodeBlock: React.FC<{ id: string; title: string; langBadge?: string; code: string }> = ({
    id,
    title,
    langBadge = 'TSX',
    code,
  }) => {
    const lines = code.trimEnd().split('\n');
    return (
      <div
        style={{
          margin: '16px 0 24px',
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${isDark ? '#1E293B' : '#334155'}`,
          backgroundColor: colors.codeBg,
          boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 8px 24px rgba(15,23,42,0.12)',
        }}
      >
        {/* IDE Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: colors.codeHeaderBg,
            borderBottom: '1px solid #1E293B',
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, marginRight: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444', opacity: 0.85 }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B', opacity: 0.85 }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.85 }} />
            </div>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 5,
                backgroundColor: 'rgba(56, 189, 248, 0.16)',
                color: '#38BDF8',
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {langBadge}
            </span>
            <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{title}</span>
            <span style={{ color: '#64748B', fontSize: 11.5 }}>({lines.length} lines)</span>
          </div>
          <button
            type="button"
            onClick={() => copyCode(id, code)}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: '1px solid #334155',
              backgroundColor: copiedCodeId === id ? '#10B981' : '#0F172A',
              color: '#FFFFFF',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {copiedCodeId === id ? (isTR ? '✓ Kopyalandı' : '✓ Copied') : isTR ? 'Kodu Kopyala' : 'Copy Code'}
          </button>
        </div>

        {/* Clean Flex Code Lines */}
        <div
          style={{
            padding: '16px 18px',
            overflowX: 'auto',
            fontSize: 13.5,
            lineHeight: 1.68,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            color: '#E2E8F0',
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                minHeight: 22,
              }}
            >
              <span
                style={{
                  width: 34,
                  flexShrink: 0,
                  userSelect: 'none',
                  paddingRight: 16,
                  textAlign: 'right',
                  color: '#475569',
                  fontSize: 12,
                }}
              >
                {i + 1}
              </span>
              <span style={{ whiteSpace: 'pre', flex: 1 }}>
                {renderHighlightedLine(line, true)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Callout: React.FC<{
    type?: 'info' | 'tip' | 'warning';
    title: string;
    children: React.ReactNode;
  }> = ({ type = 'info', title, children }) => {
    const accentColor =
      type === 'tip' ? '#10B981' : type === 'warning' ? '#F59E0B' : colors.accent;
    const bg =
      type === 'tip'
        ? isDark
          ? 'rgba(16, 185, 129, 0.08)'
          : 'rgba(16, 185, 129, 0.07)'
        : type === 'warning'
        ? isDark
          ? 'rgba(245, 158, 11, 0.09)'
          : 'rgba(245, 158, 11, 0.08)'
        : isDark
        ? 'rgba(56, 189, 248, 0.08)'
        : 'rgba(2, 132, 199, 0.06)';
    const icon = type === 'tip' ? '💡' : type === 'warning' ? '⚠️' : 'ℹ️';

    return (
      <div
        style={{
          margin: '18px 0',
          padding: '16px 20px',
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
          borderLeft: `4px solid ${accentColor}`,
          backgroundColor: bg,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 700,
            fontSize: 15,
            color: colors.text,
            marginBottom: 6,
          }}
        >
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: colors.muted }}>{children}</div>
      </div>
    );
  };

  const SimpleTable: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
    <div
      style={{
        margin: '16px 0 24px',
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5 }}>
        <thead>
          <tr style={{ backgroundColor: colors.surfaceAlt }}>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '13px 16px',
                  fontWeight: 700,
                  color: colors.text,
                  borderBottom: `1px solid ${colors.border}`,
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
                    fontSize: ci === 0 ? 13.5 : 14.5,
                    color: ci === 0 ? colors.accent : colors.text,
                    lineHeight: 1.55,
                    verticalAlign: 'top',
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

  // Combined 21-column live playground data
  const allColumnsDemoData = useMemo(
    () => [
      {
        id: 1,
        code: 'ACC-100001',
        company: 'Acme Global Holding',
        managerId: 'MGR-01',
        metadata: { tier: 'Enterprise', sla: '99.99%', costCenter: 'CC-201' },
        city: 'Istanbul',
        status: 'active',
        tags: ['SOC2', 'GDPR'],
        quantity: 250,
        balance: 65420.5,
        yoyGrowth: 18.4,
        progress: 85,
        isApproved: true,
        rating: 5,
        date: '2025-05-14',
        lastAuditAt: '2025-05-14 14:30',
        cutoffTime: '09:30',
        email: 'finance@acmeglobal.io',
        website: 'https://acmeglobal.io',
        phone: '+1 (415) 390-2100',
        tagColor: '#38BDF8',
        sparkline: [25, 40, 35, 60, 55, 75, 90],
      },
      {
        id: 2,
        code: 'ACC-100002',
        company: 'Nexus Cloud Tech',
        managerId: 'MGR-02',
        metadata: { tier: 'Strategic', sla: '99.95%', costCenter: 'CC-202' },
        city: 'London',
        status: 'pending',
        tags: ['ISO27001', 'SOC2', 'HIPAA'],
        quantity: 1420,
        balance: 128900.0,
        yoyGrowth: -6.2,
        progress: 62,
        isApproved: false,
        rating: 4,
        date: '2025-06-22',
        lastAuditAt: '2025-06-22 09:15',
        cutoffTime: '14:00',
        email: 'billing@nexuscloud.io',
        website: 'https://nexuscloud.io',
        phone: '+44 20 7946 0921',
        tagColor: '#10B981',
        sparkline: [80, 70, 65, 50, 58, 45, 40],
      },
      {
        id: 3,
        code: 'ACC-100003',
        company: 'Vertex BioPharma',
        managerId: 'MGR-03',
        metadata: { tier: 'Growth', sla: '99.90%', costCenter: 'CC-203' },
        city: 'New York',
        status: 'rejected',
        tags: ['GDPR'],
        quantity: 85,
        balance: 42150.75,
        yoyGrowth: 24.9,
        progress: 94,
        isApproved: true,
        rating: 3,
        date: '2025-08-09',
        lastAuditAt: '2025-08-09 17:45',
        cutoffTime: '17:45',
        email: 'ops@vertexlabs.io',
        website: 'https://vertexlabs.io',
        phone: '+90 (212) 555-0199',
        tagColor: '#8B5CF6',
        sparkline: [15, 30, 45, 52, 68, 82, 95],
      },
    ],
    []
  );

  const renderColumnsSection = (tr: boolean) => (
    <div>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: colors.muted, marginTop: 0 }}>
        {tr
          ? 'SheetGL Pro, kurumsal uygulamalar için kutudan çıktığı anda hazır 21 yerleşik sütun türü (ColumnType) sunar. Aşağıdaki her bir sütun kartında o sütunun canlı interaktif tablosunu doğrudan test edebilir ve yapılandırma kodunu kopyalayabilirsiniz.'
          : 'SheetGL Pro ships with 21 built-in enterprise column types out of the box. Every column card below includes both a live interactive example grid and its exact configuration code.'}
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
                onClick={() => setColCategoryFilter(tab.id)}
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
                {tr ? tab.labelTr : tab.labelEn}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={colSearch}
          onChange={(e) => setColSearch(e.target.value)}
          placeholder={tr ? 'Sütun türü ara (ör. object, lookup, currency)...' : 'Filter column types (e.g. object, lookup, currency)...'}
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

      {/* Live Master Interactive Showcase of Filtered Column Types */}
      <div id="col-playground">
        <LiveDemoBox
          title={
            tr
              ? `Canlı Sütun Türleri Deneme Tablosu (${filteredColumnGuides.length} Sütun Aktif)`
              : `Live Column Types Interactive Playground (${filteredColumnGuides.length} Active Columns)`
          }
          subtitle={
            tr
              ? 'Hücrelere çift tıklayarak (veya F2 ile) her bir sütun türünün özel düzenleyicisini canlı olarak test edin.'
              : 'Double-click or press F2 on any cell below to test each column type’s custom inline editor live.'
          }
          hints={
            tr
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
          height={240}
          data={allColumnsDemoData}
          columns={[
            { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 60, pinned: 'left', readonly: true },
            ...filteredColumnGuides.map((g) => g.sampleColumnDef),
          ]}
        />
      </div>

      {/* Detailed Guide Card for Each Column Type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {filteredColumnGuides.map((col, idx) => {
          const isMiniLiveOpen = activeLiveColType === col.type;
          return (
            <div
              key={col.type}
              id={`col-type-${col.type}`}
              style={{
                borderRadius: 14,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                padding: '24px 26px',
                boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.25)' : '0 4px 14px rgba(15,23,42,0.04)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  paddingBottom: 14,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      backgroundColor: colors.accentBg,
                      color: colors.accent,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    type: '{col.type}'
                  </span>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: colors.text }}>
                    {tr ? col.titleTr : col.titleEn}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setActiveLiveColType(isMiniLiveOpen ? null : col.type)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: `1px solid ${colors.accent}`,
                      backgroundColor: isMiniLiveOpen ? colors.accent : colors.accentBg,
                      color: isMiniLiveOpen ? '#FFFFFF' : colors.accent,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isMiniLiveOpen
                      ? tr
                        ? '▼ Canlı Örneği Gizle'
                        : '▼ Hide Live Preview'
                      : tr
                      ? '▶ Bu Sütunu Canlı Dene'
                      : '▶ Try Live Example'}
                  </button>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      backgroundColor: colors.surfaceAlt,
                      color: colors.muted,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {tr ? col.categoryLabelTr : col.categoryLabelEn}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 15.5, lineHeight: 1.7, color: colors.text, margin: '14px 0' }}>
                {tr ? col.summaryTr : col.summaryEn}
              </p>

              {/* Dedicated Single-Column Live Sandbox when toggled */}
              {isMiniLiveOpen && (
                <LiveDemoBox
                  title={
                    tr
                      ? `Canlı Örnek — type: '${col.type}'`
                      : `Live Sandbox — type: '${col.type}'`
                  }
                  subtitle={tr ? col.editorTr : col.editorEn}
                  height={215}
                  data={col.sampleRows}
                  columns={[
                    { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
                    { id: 'company', title: tr ? 'Şirket' : 'Company', type: 'text', width: 170 },
                    col.sampleColumnDef,
                  ]}
                />
              )}

              {/* Metadata Grid: Data Type, Sample Value, Editor Behavior */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 12,
                  margin: '14px 0 18px',
                }}
              >
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    backgroundColor: colors.surfaceAlt,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.muted, textTransform: 'uppercase' }}>
                    {tr ? 'Veri Tipi & Örnek Hücre Değeri' : 'Row Data Type & Sample Value'}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.accent,
                    }}
                  >
                    {col.dataType}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12.5,
                      color: colors.text,
                    }}
                  >
                    {col.sampleValue}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    backgroundColor: colors.surfaceAlt,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.muted, textTransform: 'uppercase' }}>
                    {tr ? 'Düzenleyici (Editor) Davranışı' : 'Inline Editor Behavior'}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.55, color: colors.text }}>
                    {tr ? col.editorTr : col.editorEn}
                  </div>
                </div>
              </div>

              {/* Type-Specific Props Table (if any) */}
              {col.propsList.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.muted, marginBottom: 8 }}>
                    {tr ? 'Bu Sütun Türüne Özel ColumnDef Özellikleri:' : 'Type-Specific ColumnDef Properties:'}
                  </div>
                  <SimpleTable
                    headers={
                      tr
                        ? ['Özellik (Prop)', 'Tip', 'Açıklama']
                        : ['Property', 'Type', 'Description']
                    }
                    rows={col.propsList.map((p) => [
                      p.prop,
                      p.type,
                      tr ? p.descTr : p.descEn,
                    ])}
                  />
                </div>
              )}

              {/* Code Example */}
              <CodeBlock
                id={`col-code-${col.type}-${idx}`}
                title={`ColumnDef — type: '${col.type}'`}
                langBadge="TSX"
                code={col.code}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  // Validation Live Playground Columns (Static + DevExtreme Deferred Async)
  const validationPlaygroundCols = useMemo<ColumnDef[]>(
    () => [
      { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
      {
        id: 'code',
        title: isTR ? 'Hesap Kodu (Deferred Async)' : 'Account Code (Deferred Async)',
        type: 'text',
        width: 210,
        validationRules: [
          {
            type: 'required',
            message: isTR ? 'Hesap kodu zorunludur!' : 'Account code is required!',
          },
          {
            type: 'pattern',
            pattern: /^ACC-\d{6}$/,
            message: isTR
              ? 'Format "ACC-100001" şeklinde olmalıdır!'
              : 'Must match "ACC-100001" format!',
          },
          {
            type: 'async',
            message: isTR
              ? 'Backend Deferred Reddi: ACC-000000 ve ACC-999999 rezerve edilmiştir (false döndü)!'
              : 'Backend Deferred Rejected: ACC-000000 and ACC-999999 are reserved (returned false)!',
            validationCallback: ({ value, deferred }) => {
              // DevExtreme-style Deferred async backend check returning true or false
              setTimeout(() => {
                const isAllowed = value !== 'ACC-000000' && value !== 'ACC-999999';
                deferred.resolve(isAllowed);
              }, 240);
              return deferred.promise();
            },
          },
        ],
      },
      {
        id: 'email',
        title: isTR ? 'E-Posta (Deferred Async)' : 'Email (Deferred Async)',
        type: 'email',
        width: 215,
        validationRules: [
          { type: 'required' },
          { type: 'email' },
          {
            type: 'async',
            message: isTR
              ? 'Bu e-posta (taken@acme.io) sunucuda zaten kayıtlı (false)!'
              : 'This email (taken@acme.io) is already registered on the server (false)!',
            validationCallback: ({ value }) => {
              const d = new Deferred<boolean>();
              setTimeout(() => {
                const isUnique = String(value).trim().toLowerCase() !== 'taken@acme.io';
                d.resolve(isUnique);
              }, 220);
              return d.promise();
            },
          },
        ],
      },
      {
        id: 'balance',
        title: isTR ? 'Bakiye ($0 - $1M Range)' : 'Balance ($0 - $1M Range)',
        type: 'currency',
        width: 190,
        currencySymbol: '$',
        decimalDigits: 2,
        validationRules: [
          { type: 'required' },
          {
            type: 'range',
            min: 0,
            max: 1000000,
            message: isTR
              ? 'Bakiye $0 ile $1,000,000 arasında olmalıdır (Negatif girilemez)!'
              : 'Balance must be between $0 and $1,000,000 (Cannot be negative)!',
          },
        ],
      },
    ],
    [isTR]
  );

  const validationPlaygroundData = useMemo(
    () => [
      { id: 1, code: 'ACC-100001', email: 'finance@acme.io', balance: 45000 },
      { id: 2, code: 'ACC-100002', email: 'ops@nexus.io', balance: 128500 },
      { id: 3, code: 'ACC-100003', email: 'legal@vertex.io', balance: 92000 },
    ],
    []
  );

  // Cascading Events Live Playground Columns
  const cascadePlaygroundCols = useMemo<ColumnDef[]>(
    () => [
      { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 60, readonly: true },
      {
        id: 'city',
        title: isTR ? 'Şehir Seçin (Async Cascade) ⚡' : 'Select City (Async Cascade) ⚡',
        type: 'dropdown',
        width: 210,
        options: DOC_CITY_OPTIONS,
        setCellValue: async (newData, newCity, currentRow) => {
          await new Promise((r) => setTimeout(r, 200));
          const taxMap: Record<string, number> = {
            Istanbul: 20,
            London: 15,
            'New York': 10,
            Tokyo: 12,
          };
          const tax = taxMap[newCity] ?? 18;
          const gross = Number(currentRow.balance) || 0;
          const net = Math.round(gross * (1 - tax / 100) * 100) / 100;
          newData.taxRate = tax;
          newData.netBalance = net;
          setCascadeLogs((prev) => [
            `[${new Date().toLocaleTimeString()}] Row #${currentRow.id}: city="${newCity}" → Backend returned taxRate=${tax}%, netBalance=$${net.toLocaleString()}`,
            ...prev.slice(0, 4),
          ]);
        },
      },
      {
        id: 'balance',
        title: isTR ? 'Brüt Bakiye ($) ⚡' : 'Gross Balance ($) ⚡',
        type: 'currency',
        width: 165,
        currencySymbol: '$',
        setCellValue: (newData, newBal, currentRow) => {
          const tax = Number(currentRow.taxRate) || 0;
          newData.netBalance = Math.round(Number(newBal) * (1 - tax / 100) * 100) / 100;
        },
      },
      {
        id: 'taxRate',
        title: isTR ? 'Vergi Oranı (%)' : 'Tax Rate (%)',
        type: 'progress',
        width: 140,
        readonly: true,
        permission: 'readonly',
      },
      {
        id: 'netBalance',
        title: isTR ? 'Net Bakiye ($)' : 'Net Balance ($)',
        type: 'currency',
        width: 165,
        currencySymbol: '$',
        readonly: true,
        permission: 'readonly',
      },
    ],
    [isTR]
  );

  const cascadePlaygroundData = useMemo(
    () => [
      { id: 1, city: 'Istanbul', balance: 100000, taxRate: 20, netBalance: 80000 },
      { id: 2, city: 'London', balance: 80000, taxRate: 15, netBalance: 68000 },
      { id: 3, city: 'New York', balance: 150000, taxRate: 10, netBalance: 135000 },
    ],
    []
  );

  const sections: DocSection[] = useMemo(
    () => [
      {
        id: 'quickstart',
        step: '1',
        badgeTr: 'BAŞLANGIÇ & CANLI ÖRNEK',
        badgeEn: 'QUICK START & LIVE EXAMPLE',
        titleTr: 'Kurulum, Mimari & Hızlı Başlangıç',
        titleEn: 'Installation, Architecture & Quick Start',
        subtitleTr:
          'SheetGL Pro paketini NPM veya NPX CLI ile kurun; aşağıdaki canlı interaktif tabloyu ve başlangıç kodunu inceleyin.',
        subtitleEn:
          'Install SheetGL Pro via NPM or NPX CLI; explore the live interactive starter grid and code below.',
        subItems: [
          { id: 'qs-live', labelTr: 'Canlı Başlangıç Tablosu', labelEn: 'Live Starter Grid' },
          { id: 'qs-install', labelTr: 'NPM & NPX CLI Kurulumu', labelEn: 'NPM & NPX CLI Setup' },
          { id: 'qs-code', labelTr: 'Başlangıç Tablo Kodu', labelEn: 'Starter Component Code' },
        ],
        contentTr: (
          <div>
            <div id="qs-live">
              <LiveDemoBox
                title="Hızlı Başlangıç Canlı Örnek Tablosu"
                subtitle="Hücrelere çift tıklayarak düzenleyin, sağ alt kareden (Fill Handle) aşağı sürükleyin veya sütun başlığından filtreleyin."
                hints={[
                  'Hesap Kodu hücresini sağ alt köşeden aşağı sürükleyin (ACC-100001 → ACC-100004)',
                  'Değiştirilen hücrelerin DevExtreme tarzı yeşil vurgulandığını görün',
                ]}
                height={255}
                data={allColumnsDemoData}
                columns={[
                  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, pinned: 'left', readonly: true },
                  { id: 'code', title: 'Hesap Kodu', type: 'text', width: 135, pinned: 'left' },
                  { id: 'company', title: 'Şirket Adı', type: 'text', width: 200 },
                  { id: 'city', title: 'Şehir', type: 'dropdown', width: 165, options: DOC_CITY_OPTIONS },
                  { id: 'balance', title: 'Bakiye ($)', type: 'currency', width: 150, currencySymbol: '$', summaryType: 'sum' },
                  { id: 'status', title: 'Durum', type: 'select', width: 140, options: DOC_STATUS_OPTIONS },
                  { id: 'isApproved', title: 'Onaylı', type: 'boolean', width: 95 },
                ]}
              />
            </div>

            <h3 id="qs-install" style={{ fontSize: 20, fontWeight: 800, margin: '24px 0 8px' }}>
              NPM ile Kurulum veya NPX ile Otomatik Şablon
            </h3>
            <CodeBlock
              id="install-tr"
              title="Terminal — Paket Kurulumu & CLI"
              langBadge="BASH"
              code={`# 1. NPM / PNPM / Yarn ile kütüphaneyi kurun
npm install sheetgl

# 2. İsteğe bağlı: Hazır kurumsal tablo bileşenini tek komutla projenize üretin
npx sheetgl init --dir ./src/components --name FinancialGrid --rows 1000`}
            />

            <h3 id="qs-code" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
              Yukarıdaki Canlı Tablonun Tam Kodu
            </h3>
            <CodeBlock
              id="usage-tr"
              title="src/FinancialGrid.tsx"
              langBadge="TSX"
              code={`import React from 'react';
import { SheetGL, ColumnDef } from 'sheetgl';

const columns: ColumnDef[] = [
  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, pinned: 'left', readonly: true },
  { id: 'code', title: 'Hesap Kodu', type: 'text', width: 135, pinned: 'left' },
  { id: 'company', title: 'Şirket Adı', type: 'text', width: 200 },
  {
    id: 'city',
    title: 'Şehir',
    type: 'dropdown',
    width: 165,
    options: [
      { value: 'Istanbul', label: 'Istanbul', icon: '🌉', subtitle: 'EMEA Hub • 20% Tax' },
      { value: 'London', label: 'London', icon: '🇬🇧', subtitle: 'Europe • 15% Tax' },
    ],
  },
  { id: 'balance', title: 'Bakiye ($)', type: 'currency', width: 150, currencySymbol: '$', summaryType: 'sum' },
  { id: 'isApproved', title: 'Onaylı', type: 'boolean', width: 95 },
];

export default function FinancialGrid({ rows }: { rows: any[] }) {
  return (
    <div style={{ width: '100%', height: 600 }}>
      <SheetGL
        dataSource={rows}
        columns={columns}
        theme="apple-dark"
        locale="tr-TR"
        batchEditMode={true}
      />
    </div>
  );
}`}
            />
          </div>
        ),
        contentEn: (
          <div>
            <div id="qs-live">
              <LiveDemoBox
                title="Quick Start Live Interactive Grid"
                subtitle="Double-click cells to edit, drag the bottom-right Fill Handle square, or click any column funnel icon to filter."
                hints={[
                  'Drag the Fill Handle on Account Code down (ACC-100001 → ACC-100004)',
                  'Notice how edited cells are highlighted in DevExtreme green',
                ]}
                height={255}
                data={allColumnsDemoData}
                columns={[
                  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, pinned: 'left', readonly: true },
                  { id: 'code', title: 'Account Code', type: 'text', width: 135, pinned: 'left' },
                  { id: 'company', title: 'Company Name', type: 'text', width: 200 },
                  { id: 'city', title: 'City', type: 'dropdown', width: 165, options: DOC_CITY_OPTIONS },
                  { id: 'balance', title: 'Balance ($)', type: 'currency', width: 150, currencySymbol: '$', summaryType: 'sum' },
                  { id: 'status', title: 'Status', type: 'select', width: 140, options: DOC_STATUS_OPTIONS },
                  { id: 'isApproved', title: 'Approved', type: 'boolean', width: 95 },
                ]}
              />
            </div>

            <h3 id="qs-install" style={{ fontSize: 20, fontWeight: 800, margin: '24px 0 8px' }}>
              Install via NPM or Scaffold with NPX CLI
            </h3>
            <CodeBlock
              id="install-en"
              title="Terminal — Installation & CLI Generator"
              langBadge="BASH"
              code={`# 1. Install package via NPM / PNPM / Yarn
npm install sheetgl

# 2. Optional: Scaffold a ready-to-run TypeScript grid component
npx sheetgl init --dir ./src/components --name FinancialGrid --rows 1000`}
            />

            <h3 id="qs-code" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
              Complete Code for the Live Example Above
            </h3>
            <CodeBlock
              id="usage-en"
              title="src/FinancialGrid.tsx"
              langBadge="TSX"
              code={`import React from 'react';
import { SheetGL, ColumnDef } from 'sheetgl';

const columns: ColumnDef[] = [
  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, pinned: 'left', readonly: true },
  { id: 'code', title: 'Account Code', type: 'text', width: 135, pinned: 'left' },
  { id: 'company', title: 'Company Name', type: 'text', width: 200 },
  {
    id: 'city',
    title: 'City',
    type: 'dropdown',
    width: 165,
    options: [
      { value: 'Istanbul', label: 'Istanbul', icon: '🌉', subtitle: 'EMEA Hub • 20% Tax' },
      { value: 'London', label: 'London', icon: '🇬🇧', subtitle: 'Europe • 15% Tax' },
    ],
  },
  { id: 'balance', title: 'Balance ($)', type: 'currency', width: 150, currencySymbol: '$', summaryType: 'sum' },
  { id: 'isApproved', title: 'Approved', type: 'boolean', width: 95 },
];

export default function FinancialGrid({ rows }: { rows: any[] }) {
  return (
    <div style={{ width: '100%', height: 600 }}>
      <SheetGL
        dataSource={rows}
        columns={columns}
        theme="apple-dark"
        locale="en-US"
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
        id: 'columns',
        step: '2',
        badgeTr: '21 SÜTUN TÜRÜ & CANLI ÖRNEKLER',
        badgeEn: '21 COLUMN TYPES & LIVE EXAMPLES',
        titleTr: 'Tüm Sütun Türleri Rehberi (21 Tip)',
        titleEn: 'Complete Guide to All 21 Column Types',
        subtitleTr:
          'Her bir sütun türünü canlı tabloda test edin; veri yapısını, özel ayarlarını ve kod örneklerini inceleyin.',
        subtitleEn:
          'Test every column type in the live sandbox; inspect data formats, type-specific properties, and TSX code.',
        subItems: [
          {
            id: 'col-playground',
            labelTr: 'Canlı Sütun Deneme Tablosu',
            labelEn: 'Live Columns Playground',
            onSelect: () => setColCategoryFilter('all'),
          },
          ...COLUMN_GUIDES.map((g) => ({
            id: `col-type-${g.type}`,
            labelTr: `${g.type} — ${g.titleTr.split(' (')[0]}`,
            labelEn: `${g.type} — ${g.titleEn.split(' (')[0]}`,
            onSelect: () => setColCategoryFilter('all'),
          })),
        ],
        contentTr: renderColumnsSection(true),
        contentEn: renderColumnsSection(false),
      },
      {
        id: 'validation',
        step: '3',
        badgeTr: 'DEFERRED ASYNC & STATIC VALIDATION',
        badgeEn: 'DEFERRED ASYNC & STATIC VALIDATION',
        titleTr: 'Doğrulama Kuralları (Static & Deferred Async)',
        titleEn: 'Validation Rules (Static & Deferred Async)',
        subtitleTr:
          'Statik kurallara veya Backend API Deferred nesnesinden dönen true / false sonucuna göre geçersiz girişleri engelleyin.',
        subtitleEn:
          'Block invalid cell updates based on static rules or backend Deferred.resolve(true / false) responses.',
        subItems: [
          { id: 'val-live', labelTr: 'Canlı Doğrulama Test Tablosu', labelEn: 'Live Validation Playground' },
          { id: 'val-deferred', labelTr: 'DevExtreme Deferred Async (true/false)', labelEn: 'DevExtreme Deferred Async (true/false)' },
          { id: 'val-table', labelTr: 'Tüm Doğrulama Kuralları Tablosu', labelEn: 'All Validation Rules Reference' },
        ],
        contentTr: (
          <div>
            <div id="val-live">
              <LiveDemoBox
                title="Canlı Doğrulama (Static & Backend Deferred Async) Test Tablosu"
                subtitle="Aşağıdaki hücrelerde kural dışı bir değer girip Enter tuşuna basın: giriş engellenecek ve hücre altında kırmızı ⛔ hata mesajı açılacaktır."
                hints={[
                  'Hesap Kodu hücresine "ACC-000000" yazıp Enter’a basın → Backend Deferred false döner ve girişi engeller!',
                  'E-Posta hücresine "taken@acme.io" yazın → new Deferred() false döner ve girişi engeller!',
                  'Bakiye hücresine "-500" yazın → Statik range kuralı negatif girişi engeller!',
                ]}
                height={240}
                data={validationPlaygroundData}
                columns={validationPlaygroundCols}
              />
            </div>

            <Callout type="tip" title="DevExtreme Tarzı Deferred (true / false) Asenkron Doğrulama">
              SheetGL Pro, DevExtreme DataGrid’deki <code>Deferred</code> yapısını birebir destekler. <code>type: 'async'</code> kuralında <code>validationCallback</code> içerisine hazır bir <code>deferred</code> nesnesi gelir (veya <code>new Deferred()</code> / <code>createDeferred()</code> oluşturabilirsiniz). Backend API’den dönen sonuca göre:
              <br />• <code>deferred.resolve(true)</code> çağrıldığında değer <strong>kabul edilir ve hücreye yazılır</strong>.
              <br />• <code>deferred.resolve(false)</code> çağrıldığında giriş <strong>kesin olarak engellenir</strong> ve kuralın <code>message</code> metni gösterilir.
              <br />• <code>deferred.reject("Sunucu özel hata mesajı")</code> çağrıldığında ise sunucudan gelen dinamik hata mesajı gösterilerek giriş engellenir.
            </Callout>

            <h3 id="val-deferred" style={{ fontSize: 20, fontWeight: 800, margin: '24px 0 8px' }}>
              DevExtreme Deferred Yapısı ile Asenkron Backend Doğrulama (true / false)
            </h3>
            <CodeBlock
              id="val-deferred-tr"
              title="DevExtreme Deferred Async Validation (resolve true / false)"
              langBadge="TSX"
              code={`import { SheetGL, ColumnDef, Deferred, createDeferred } from 'sheetgl';

const columns: ColumnDef[] = [
  {
    id: 'code',
    title: 'Hesap Kodu',
    type: 'text',
    width: 160,
    validationRules: [
      { type: 'required', message: 'Hesap kodu zorunludur!' },
      { type: 'pattern', pattern: /^ACC-\\d{6}$/, message: 'Format ACC-100001 olmalıdır!' },

      // YÖNTEM 1: Parametre olarak gelen hazır "deferred" nesnesi (DevExtreme stili)
      {
        type: 'async',
        message: 'Bu hesap kodu sunucuda zaten kayıtlı veya rezerve edilmiş!',
        validationCallback: ({ value, data, deferred }) => {
          fetch(\`/api/accounts/check-code?code=\${encodeURIComponent(value)}&id=\${data.id}\`)
            .then((res) => res.json())
            .then((response: { isValid: boolean }) => {
              // Backend'den dönen true / false değerine göre girişe izin verir veya engeller:
              deferred.resolve(response.isValid); // true -> Geçerli, false -> Giriş Engellenir!
            })
            .catch(() => {
              deferred.reject('Sunucu doğrulama servisine ulaşılamadı!');
            });

          return deferred.promise();
        },
      },
    ],
  },
  {
    id: 'email',
    title: 'Kurumsal E-Posta',
    type: 'email',
    width: 200,
    validationRules: [
      { type: 'required' },
      { type: 'email' },

      // YÖNTEM 2: "new Deferred()" veya "createDeferred()" oluşturarak kullanım
      {
        type: 'async',
        message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor!',
        validationCallback: (params) => {
          const d = createDeferred<boolean>();
          setTimeout(() => {
            const isAvailable = params.value !== 'taken@acme.io';
            d.resolve(isAvailable); // true veya false
          }, 250);
          return d.promise();
        },
      },
    ],
  },
];`}
            />

            <h3 id="val-table" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
              Tüm Doğrulama Kuralı Türleri (Static & Async)
            </h3>
            <SimpleTable
              headers={['Kural Tipi (type)', 'Yapı', 'Dönüş / Parametre', 'Açıklama']}
              rows={[
                ['required', 'Static', 'trim?: boolean, message?: string', 'Hücrenin boş bırakılmasını engeller'],
                ['range', 'Static', 'min?: number, max?: number', 'Sayısal değerin alt ve üst sınırlar içinde olmasını zorunlu kılar'],
                ['stringLength', 'Static', 'min?: number, max?: number', 'Metin karakter uzunluğunu denetler'],
                ['pattern', 'Static', 'pattern: RegExp | string', 'Değerin RegExp formatına uymasını zorunlu kılar'],
                ['email / url', 'Static', 'ignoreEmptyValue?: boolean', 'E-posta veya URL formatını doğrular'],
                ['compare', 'Static', 'comparisonTarget: (row) => any', 'Aynı satırdaki başka bir sütunla karşılaştırma yapar (==, !=, >, >=, <, <=)'],
                ['custom', 'Static Callback', 'validationCallback => boolean', 'Senkron true / false döndüren özel doğrulama fonksiyonu'],
                ['async', 'Deferred / Promise', 'deferred.resolve(true | false) veya Promise<boolean>', 'Asenkron Backend API doğrulaması; false dönerse hücre girişi engellenir'],
              ]}
            />
          </div>
        ),
        contentEn: (
          <div>
            <div id="val-live">
              <LiveDemoBox
                title="Live Validation Playground (Static & DevExtreme Deferred Async)"
                subtitle="Try entering an invalid value below and press Enter: the entry will be strictly blocked and an inline red ⛔ error banner will appear."
                hints={[
                  'Type "ACC-000000" in Account Code and press Enter → Backend Deferred resolves false and blocks entry!',
                  'Type "taken@acme.io" in Email and press Enter → new Deferred() resolves false and blocks entry!',
                  'Type "-500" in Balance and press Enter → Static range rule blocks negative numbers!',
                ]}
                height={240}
                data={validationPlaygroundData}
                columns={validationPlaygroundCols}
              />
            </div>

            <Callout type="tip" title="DevExtreme-Style Deferred (true / false) Async Validation">
              SheetGL Pro natively supports the DevExtreme DataGrid <code>Deferred</code> pattern. Inside an <code>async</code> rule’s <code>validationCallback</code>, you can use the built-in <code>deferred</code> parameter (or instantiate <code>new Deferred()</code> / <code>createDeferred()</code>):
              <br />• Calling <code>deferred.resolve(true)</code> <strong>accepts and commits</strong> the cell value.
              <br />• Calling <code>deferred.resolve(false)</code> <strong>strictly blocks the entry</strong> and displays <code>rule.message</code>.
              <br />• Calling <code>deferred.reject("Custom backend message")</code> blocks the entry with a custom server message.
            </Callout>

            <h3 id="val-deferred" style={{ fontSize: 20, fontWeight: 800, margin: '24px 0 8px' }}>
              DevExtreme Deferred Pattern for Async Backend Validation (true / false)
            </h3>
            <CodeBlock
              id="val-deferred-en"
              title="DevExtreme Deferred Async Validation (resolve true / false)"
              langBadge="TSX"
              code={`import { SheetGL, ColumnDef, Deferred, createDeferred } from 'sheetgl';

const columns: ColumnDef[] = [
  {
    id: 'code',
    title: 'Account Code',
    type: 'text',
    width: 160,
    validationRules: [
      { type: 'required', message: 'Account code is required!' },
      { type: 'pattern', pattern: /^ACC-\\d{6}$/, message: 'Must match ACC-100001 format!' },

      // PATTERN 1: Built-in "deferred" object on callback params (DevExtreme style)
      {
        type: 'async',
        message: 'This account code is already registered or reserved on the server!',
        validationCallback: ({ value, data, deferred }) => {
          fetch(\`/api/accounts/check-code?code=\${encodeURIComponent(value)}&id=\${data.id}\`)
            .then((res) => res.json())
            .then((response: { isValid: boolean }) => {
              // Resolve with boolean true or false from backend:
              deferred.resolve(response.isValid); // true -> Valid, false -> Entry Blocked!
            })
            .catch(() => {
              deferred.reject('Validation service unreachable!');
            });

          return deferred.promise();
        },
      },
    ],
  },
  {
    id: 'email',
    title: 'Corporate Email',
    type: 'email',
    width: 200,
    validationRules: [
      { type: 'required' },
      { type: 'email' },

      // PATTERN 2: Instantiating "new Deferred()" or "createDeferred()"
      {
        type: 'async',
        message: 'This email address is already taken!',
        validationCallback: (params) => {
          const d = createDeferred<boolean>();
          setTimeout(() => {
            const isAvailable = params.value !== 'taken@acme.io';
            d.resolve(isAvailable); // true or false
          }, 250);
          return d.promise();
        },
      },
    ],
  },
];`}
            />

            <h3 id="val-table" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
              Complete Reference of All 9 Validation Rule Types
            </h3>
            <SimpleTable
              headers={['Rule Type (type)', 'Mode', 'Return / Options', 'Description']}
              rows={[
                ['required', 'Static', 'trim?: boolean, message?: string', 'Prevents empty cell values'],
                ['range', 'Static', 'min?: number, max?: number', 'Enforces numeric min and max bounds'],
                ['stringLength', 'Static', 'min?: number, max?: number', 'Enforces character length bounds'],
                ['pattern', 'Static', 'pattern: RegExp | string', 'Requires value to match a RegExp pattern'],
                ['email / url', 'Static', 'ignoreEmptyValue?: boolean', 'Validates email or http/https URL format'],
                ['compare', 'Static', 'comparisonTarget: (row) => any', 'Compares value against another field in the same row (==, !=, >, >=, <, <=)'],
                ['custom', 'Static Callback', 'validationCallback => boolean', 'Synchronous callback returning true or false'],
                ['async', 'Deferred / Promise', 'deferred.resolve(true | false) or Promise<boolean>', 'Async backend validation; resolving false strictly blocks cell entry'],
              ]}
            />
          </div>
        ),
      },
      {
        id: 'permissions',
        step: '4',
        badgeTr: 'YETKİLENDİRME & CANLI ÖRNEK',
        badgeEn: 'PERMISSIONS & LIVE EXAMPLE',
        titleTr: '3 Katmanlı Yetkilendirme (RBAC)',
        titleEn: '3-Tier Permissions (Grid, Column & Row Locks)',
        subtitleTr:
          'Tablo genelinde, sütun bazında veya satır koşuluna göre yazma ve salt-okunur (Read-Only) kurallarını canlı test edin.',
        subtitleEn:
          'Test global Grid permissions, Column-level locks, and dynamic Row/Cell locks in the live example below.',
        subItems: [
          { id: 'perm-live', labelTr: 'Canlı Yetkilendirme Testi', labelEn: 'Live Permissions Playground' },
          { id: 'perm-code', labelTr: 'Grid, Sütun & Satır Kilidi Kodu', labelEn: '3-Tier Permissions Code' },
        ],
        contentTr: (
          <div>
            <div id="perm-live" style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setPermModeDemo((m) => (m === 'write' ? 'readonly' : 'write'))}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: `1px solid ${colors.accent}`,
                  backgroundColor: colors.accentBg,
                  color: colors.accent,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {permModeDemo === 'write'
                  ? '🔓 Tablo Modu: Yazılabilir (Write) — Salt Okunur Yapmak İçin Tıklayın'
                  : '🔒 Tablo Modu: Salt Okunur (Read-Only) — Yazılabilir Yapmak İçin Tıklayın'}
              </button>
            </div>

            <LiveDemoBox
              title="3 Katmanlı Yetkilendirme Canlı Test Tablosu"
              subtitle="1) ID sütunu sütun bazlı kilitlidir (🔒). 2) Durumu 'Rejected' olan 3. satırın Bakiye hücresi canEdit kuralıyla kilitlidir."
              hints={[
                '3. satırdaki (Rejected) Bakiye hücresine çift tıklayın → Satır bazlı kilit uyarısı verir!',
                '1. veya 2. satırdaki Bakiye hücresine çift tıklayın → Düzenlenebilir!',
              ]}
              height={235}
              data={allColumnsDemoData}
              permissions={{ mode: permModeDemo }}
              columns={[
                { id: 'id', title: 'ID (Sütun Kilidi)', type: 'number', decimalDigits: 0, width: 130, permission: 'readonly' },
                { id: 'company', title: 'Şirket Adı', type: 'text', width: 200 },
                { id: 'status', title: 'Durum', type: 'select', width: 145, options: DOC_STATUS_OPTIONS },
                {
                  id: 'balance',
                  title: 'Bakiye (Rejected Satırda Kilitli)',
                  type: 'currency',
                  width: 240,
                  currencySymbol: '$',
                  canEdit: (row) => row.status !== 'rejected',
                },
              ]}
            />

            <div id="perm-code">
              <CodeBlock
                id="perm-tr"
                title="3 Katmanlı Yetkilendirme Kodu"
                langBadge="TSX"
                code={`<SheetGL
  dataSource={data}
  // 1. Tablo Katmanı
  permissions={{
    mode: 'write', // 'write' | 'readonly' | 'read'
    allowAdding: true,
    allowUpdating: true,
    allowDeleting: true,
  }}
  columns={[
    // 2. Sütun Katmanı (Başlıkta 🔒 ikonu gösterir)
    { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, permission: 'readonly' },

    // 3. Satır / Hücre Katmanı (Dinamik Koşul)
    {
      id: 'balance',
      title: 'Brüt Bakiye ($)',
      type: 'currency',
      canEdit: (row) => row.status !== 'rejected', // Sadece rejected olmayan satırlar düzenlenebilir
    },
  ]}
/>`}
              />
            </div>
          </div>
        ),
        contentEn: (
          <div>
            <div id="perm-live" style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setPermModeDemo((m) => (m === 'write' ? 'readonly' : 'write'))}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: `1px solid ${colors.accent}`,
                  backgroundColor: colors.accentBg,
                  color: colors.accent,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {permModeDemo === 'write'
                  ? '🔓 Grid Mode: Writable (Write) — Click to Switch to Read-Only'
                  : '🔒 Grid Mode: Read-Only — Click to Switch to Writable'}
              </button>
            </div>

            <LiveDemoBox
              title="3-Tier Permissions Live Interactive Grid"
              subtitle="1) ID column is locked at the column tier (🔒). 2) Row #3 has status 'Rejected', so its Balance cell is dynamically locked by canEdit."
              hints={[
                'Double-click Balance on Row #3 (Rejected) → Blocked by row-level canEdit lock!',
                'Double-click Balance on Row #1 or #2 → Editable!',
              ]}
              height={235}
              data={allColumnsDemoData}
              permissions={{ mode: permModeDemo }}
              columns={[
                { id: 'id', title: 'ID (Column Lock)', type: 'number', decimalDigits: 0, width: 135, permission: 'readonly' },
                { id: 'company', title: 'Company Name', type: 'text', width: 200 },
                { id: 'status', title: 'Status', type: 'select', width: 145, options: DOC_STATUS_OPTIONS },
                {
                  id: 'balance',
                  title: 'Balance (Locked if Rejected)',
                  type: 'currency',
                  width: 240,
                  currencySymbol: '$',
                  canEdit: (row) => row.status !== 'rejected',
                },
              ]}
            />

            <div id="perm-code">
              <CodeBlock
                id="perm-en"
                title="3-Tier Permissions Configuration"
                langBadge="TSX"
                code={`<SheetGL
  dataSource={data}
  // 1. Grid Tier
  permissions={{
    mode: 'write', // 'write' | 'readonly' | 'read'
    allowAdding: true,
    allowUpdating: true,
    allowDeleting: true,
  }}
  columns={[
    // 2. Column Tier (Renders 🔒 badge in header)
    { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, permission: 'readonly' },

    // 3. Row / Cell Tier (Dynamic Condition)
    {
      id: 'balance',
      title: 'Gross Balance ($)',
      type: 'currency',
      canEdit: (row) => row.status !== 'rejected', // Locks cell when row status is rejected
    },
  ]}
/>`}
              />
            </div>
          </div>
        ),
      },
      {
        id: 'events',
        step: '5',
        badgeTr: 'ASYNC CASCADE & CANLI ÖRNEK',
        badgeEn: 'ASYNC CASCADE & LIVE EXAMPLE',
        titleTr: 'Asenkron Backend Tetikleyicileri & Olaylar',
        titleEn: 'Cascading Cell Triggers & Lifecycle Events',
        subtitleTr:
          'Bir hücre değiştiğinde aynı satırdaki bağımlı sütunları senkron veya Backend API üzerinden otomatik güncelleyin.',
        subtitleEn:
          'Update dependent columns on the same row synchronously or asynchronously via backend APIs when a cell changes.',
        subItems: [
          { id: 'evt-live', labelTr: 'Canlı Kademeli Güncelleme (setCellValue)', labelEn: 'Live Cascading Lookup' },
          { id: 'evt-code', labelTr: 'Asenkron Backend setCellValue Kodu', labelEn: 'Async Backend setCellValue Code' },
        ],
        contentTr: (
          <div>
            <div id="evt-live">
              <LiveDemoBox
                title="Canlı Kademeli Güncelleme (Async setCellValue) Test Tablosu"
                subtitle="Şehir sütununu değiştirdiğinizde 200ms Backend simülasyonu çalışır ve o şehrin Vergi Oranı (%) ile Net Bakiyesini ($) otomatik günceller!"
                hints={[
                  '1. satırdaki Şehir (Istanbul) hücresine çift tıklayıp "New York" veya "London" seçin',
                  'Brüt Bakiye ($) hücresini değiştirip Net Bakiyenin anında yeniden hesaplandığını görün',
                ]}
                height={235}
                data={cascadePlaygroundData}
                columns={cascadePlaygroundCols}
              />
            </div>

            {cascadeLogs.length > 0 && (
              <div
                style={{
                  marginBottom: 20,
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: colors.codeBg,
                  border: `1px solid ${colors.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12.5,
                  color: '#34D399',
                }}
              >
                {cascadeLogs.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            )}

            <div id="evt-code">
              <CodeBlock
                id="cascade-tr"
                title="setCellValue — Async Backend Cascading Lookup"
                langBadge="TSX"
                code={`const columns: ColumnDef[] = [
  {
    id: 'city',
    title: 'Şehir Seçin ⚡',
    type: 'dropdown',
    width: 200,
    options: CITY_OPTIONS,
    // Şehir değiştiğinde Backend API'den vergi oranını çekip Net Bakiyeyi otomatik hesaplar!
    setCellValue: async (newData, newCity, currentRow) => {
      const res = await fetch(\`/api/region-policy?city=\${encodeURIComponent(newCity)}\`);
      const policy = await res.json(); // { taxRate: 15 }

      const gross = Number(currentRow.balance) || 0;
      newData.taxRate = policy.taxRate;
      newData.netBalance = Math.round(gross * (1 - policy.taxRate / 100) * 100) / 100;
    },
  },
];`}
              />
            </div>
          </div>
        ),
        contentEn: (
          <div>
            <div id="evt-live">
              <LiveDemoBox
                title="Live Cascading Cells (Async setCellValue) Playground"
                subtitle="Change the City column below: a 200ms async backend lookup runs and automatically updates Tax Rate (%) and Net Balance ($)!"
                hints={[
                  'Double-click City on Row #1 (Istanbul) and change it to "New York" or "London"',
                  'Edit Gross Balance ($) and watch Net Balance ($) recalculate immediately',
                ]}
                height={235}
                data={cascadePlaygroundData}
                columns={cascadePlaygroundCols}
              />
            </div>

            {cascadeLogs.length > 0 && (
              <div
                style={{
                  marginBottom: 20,
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: colors.codeBg,
                  border: `1px solid ${colors.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12.5,
                  color: '#34D399',
                }}
              >
                {cascadeLogs.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            )}

            <div id="evt-code">
              <CodeBlock
                id="cascade-en"
                title="setCellValue — Async Backend Cascading Lookup"
                langBadge="TSX"
                code={`const columns: ColumnDef[] = [
  {
    id: 'city',
    title: 'Select City ⚡',
    type: 'dropdown',
    width: 200,
    options: CITY_OPTIONS,
    // Changing 'city' fetches regional tax policy from backend and auto-updates taxRate & netBalance!
    setCellValue: async (newData, newCity, currentRow) => {
      const res = await fetch(\`/api/region-policy?city=\${encodeURIComponent(newCity)}\`);
      const policy = await res.json(); // { taxRate: 15 }

      const gross = Number(currentRow.balance) || 0;
      newData.taxRate = policy.taxRate;
      newData.netBalance = Math.round(gross * (1 - policy.taxRate / 100) * 100) / 100;
    },
  },
];`}
              />
            </div>
          </div>
        ),
      },
      {
        id: 'filtering',
        step: '6',
        badgeTr: 'FİLTRE, GRUPLAMA & CANLI ÖRNEK',
        badgeEn: 'FILTER, GROUPING & LIVE EXAMPLE',
        titleTr: 'Filtreleme, Gruplama & Özet Satırları',
        titleEn: 'Header Filtering, Grouping & Summary Rows',
        subtitleTr:
          'Hücre formatına duyarlı değer/koşul filtreleme, çoklu sütun gruplama ve alt toplam (Summary Footer) örneği.',
        subtitleEn:
          'Cell-format-aware value & condition filtering, multi-column grouping, and sticky footer aggregations.',
        subItems: [
          { id: 'flt-live', labelTr: 'Canlı Gruplama & Filtre Örneği', labelEn: 'Live Grouping & Filter Demo' },
          { id: 'flt-code', labelTr: 'Gruplama & Summary Footer Kodu', labelEn: 'Grouping & Summary Footer Code' },
        ],
        contentTr: (
          <div>
            <div id="flt-live">
              <LiveDemoBox
                title="Canlı Gruplama, Başlık Filtresi ve Özet Satırı Örneği"
                subtitle="Sütun başlıklarındaki filtre (huni) ikonuna tıklayarak Değer veya Koşul filtresi uygulayın; üstteki grup çubuğundan gruplamayı yönetin."
                hints={[
                  'Bakiye ($) sütun başlığındaki filtre ikonuna tıklayıp "Koşul Filtresi -> Büyük (>)" deneyin',
                  'Grup satırlarına tıklayarak grupları daraltıp genişletin',
                ]}
                height={290}
                data={allColumnsDemoData}
                showGroupPanel={true}
                showSummaryFooter={true}
                initialGroups={[{ selector: 'city' }]}
                columns={[
                  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
                  { id: 'company', title: 'Şirket', type: 'text', width: 190 },
                  { id: 'city', title: 'Şehir', type: 'dropdown', width: 165, groupable: true, options: DOC_CITY_OPTIONS },
                  { id: 'status', title: 'Durum', type: 'select', width: 145, groupable: true, options: DOC_STATUS_OPTIONS },
                  { id: 'balance', title: 'Brüt Bakiye ($)', type: 'currency', width: 165, currencySymbol: '$', summaryType: 'sum' },
                  { id: 'progress', title: 'Kota (%)', type: 'progress', width: 140, summaryType: 'avg' },
                ]}
              />
            </div>

            <div id="flt-code">
              <CodeBlock
                id="filter-group-tr"
                title="Gruplama ve Alt Özet Satırı (Summary Footer)"
                langBadge="TSX"
                code={`<SheetGL
  dataSource={rows}
  columns={[
    { id: 'company', title: 'Şirket', type: 'text', width: 190 },
    { id: 'city', title: 'Şehir', type: 'dropdown', width: 165, groupable: true, filterable: true },
    { id: 'balance', title: 'Brüt Bakiye ($)', type: 'currency', width: 165, summaryType: 'sum' },
    { id: 'progress', title: 'Kota (%)', type: 'progress', width: 140, summaryType: 'avg' },
  ]}
  initialGroups={[{ selector: 'city' }]}
  showGroupPanel={true}
  showSummaryFooter={true}
/>`}
              />
            </div>
          </div>
        ),
        contentEn: (
          <div>
            <div id="flt-live">
              <LiveDemoBox
                title="Live Grouping, Header Filter & Summary Footer Example"
                subtitle="Click the funnel icon on any column header to filter by formatted values or conditions; click group rows to expand/collapse."
                hints={[
                  'Click the filter funnel icon on Gross Balance ($) and test Condition Filter -> Greater than (>)',
                  'Click group header rows to collapse or expand grouped records',
                ]}
                height={290}
                data={allColumnsDemoData}
                showGroupPanel={true}
                showSummaryFooter={true}
                initialGroups={[{ selector: 'city' }]}
                columns={[
                  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
                  { id: 'company', title: 'Company', type: 'text', width: 190 },
                  { id: 'city', title: 'City', type: 'dropdown', width: 165, groupable: true, options: DOC_CITY_OPTIONS },
                  { id: 'status', title: 'Status', type: 'select', width: 145, groupable: true, options: DOC_STATUS_OPTIONS },
                  { id: 'balance', title: 'Gross Balance ($)', type: 'currency', width: 165, currencySymbol: '$', summaryType: 'sum' },
                  { id: 'progress', title: 'Quota (%)', type: 'progress', width: 140, summaryType: 'avg' },
                ]}
              />
            </div>

            <div id="flt-code">
              <CodeBlock
                id="filter-group-en"
                title="Multi-Column Grouping & Sticky Summary Footer"
                langBadge="TSX"
                code={`<SheetGL
  dataSource={rows}
  columns={[
    { id: 'company', title: 'Company', type: 'text', width: 190 },
    { id: 'city', title: 'City', type: 'dropdown', width: 165, groupable: true, filterable: true },
    { id: 'balance', title: 'Gross Balance ($)', type: 'currency', width: 165, summaryType: 'sum' },
    { id: 'progress', title: 'Quota (%)', type: 'progress', width: 140, summaryType: 'avg' },
  ]}
  initialGroups={[{ selector: 'city' }]}
  showGroupPanel={true}
  showSummaryFooter={true}
/>`}
              />
            </div>
          </div>
        ),
      },
      {
        id: 'excel-ux',
        step: '7',
        badgeTr: 'EXCEL KISAYOLLARI',
        badgeEn: 'EXCEL SHORTCUTS',
        titleTr: 'Excel Klavye Kısayolları, Fill Handle & Pano',
        titleEn: 'Excel Shortcuts, Fill Handle & TSV Clipboard',
        subtitleTr:
          'Microsoft Excel ve Google Sheets uyumlu tüm klavye ve fare kısayolları.',
        subtitleEn:
          'Complete keyboard navigation, Fill Handle series auto-increment, and Microsoft Excel / Google Sheets clipboard integration.',
        subItems: [
          { id: 'ux-table', labelTr: 'Klavye & Fare Kısayolları Tablosu', labelEn: 'Keyboard & Mouse Shortcuts' },
        ],
        contentTr: (
          <div id="ux-table">
            <SimpleTable
              headers={['Kısayol / Eylem', 'İşlev ve Davranış']}
              rows={[
                ['Fill Handle (Sağ Alt Kare)', 'Sürükleyerek hücreleri otomatik doldurur ve seri kodları artırır (ACC-100001 → ACC-100002)'],
                ['Hücre Sağ Yan (+) Butonu', 'Tıklayarak veya sürükleyerek aktif hücreyi komşu hücrelere hızlıca çoğaltır'],
                ['Ctrl + D / Ctrl + R', 'Seçili hücreyi aşağı (Fill Down) veya sağa (Fill Right) çoğaltır'],
                ['Shift + D', 'Aktif satırı olduğu gibi hemen altına yeni satır olarak çoğaltır (Duplicate Row)'],
                ['Ctrl + C / Ctrl + V', 'Microsoft Excel ve Google Sheets ile birebir uyumlu TSV kopyala ve yapıştır'],
                ['Ctrl + Z / Ctrl + Y', 'Kademeli (cascading) güncellemeleri de kapsayan 100 adımlı Geri Al (Undo) ve İleri Al (Redo)'],
                ['F2 / Çift Tıklama', 'Aktif hücrenin Micro-DOM düzenleyicisini açar'],
                ['Enter / Tab', 'Değeri doğrular, kaydeder ve bir alt / sağ hücreye geçer'],
              ]}
            />
          </div>
        ),
        contentEn: (
          <div id="ux-table">
            <SimpleTable
              headers={['Shortcut / Gesture', 'Behavior']}
              rows={[
                ['Fill Handle (Bottom-Right Square)', 'Drag across rows/columns to auto-fill values and increment series codes (ACC-100001 → ACC-100002)'],
                ['Right-Side (+) Handle', 'Click or drag to duplicate active cell into adjacent cells'],
                ['Ctrl + D / Ctrl + R', 'Fill Down / Fill Right across selected cells'],
                ['Shift + D', 'Duplicate Row — clones the entire active record directly underneath'],
                ['Ctrl + C / Ctrl + V', 'Native Microsoft Excel & Google Sheets TSV clipboard copy and paste'],
                ['Ctrl + Z / Ctrl + Y', '100-step Undo / Redo stack (including cascading field updates)'],
                ['F2 / Double-Click', 'Opens the inline Micro-DOM editor for the active cell'],
                ['Enter / Tab', 'Validates, commits, and moves selection down / right'],
              ]}
            />
          </div>
        ),
      },
      {
        id: 'batch-store',
        step: '8',
        badgeTr: 'BATCH SAVE & CANLI ÖRNEK',
        badgeEn: 'BATCH SAVE & LIVE EXAMPLE',
        titleTr: 'Batch Save (Yeşil Hücre Vurgusu) & Veri Katmanı',
        titleEn: 'Batch Save (Dirty Cell Highlighting) & Data Stores',
        subtitleTr:
          'DevExtreme tarzı değiştirilen hücrelerin yeşil vurgulanması, yeni satır ekleme/çoğaltma ve toplu kaydetme örneği.',
        subtitleEn:
          'DevExtreme-style dirty cell highlighting, row insertion/duplication, and transactional Batch Save / Discard.',
        subItems: [
          { id: 'batch-live', labelTr: 'Canlı Batch Save & Yeşil Hücre Vurgusu', labelEn: 'Live Batch Save Playground' },
          { id: 'batch-code', labelTr: 'onSaving Backend Kayıt Kodu', labelEn: 'onSaving Backend Commit Code' },
        ],
        contentTr: (
          <div>
            <div id="batch-live">
              <LiveDemoBox
                title="Canlı Batch Save & CRUD Araç Çubuğu Örneği"
                subtitle="Herhangi bir hücreyi değiştirin veya '+ Satır Ekle' butonuna basın: üst araç çubuğunda Kaydet ve İptal (Geri Al) butonları belirecektir."
                hints={[
                  'Birkaç hücreyi düzenleyip yeşil vurguyu görün, ardından üstteki "Kaydet" veya "Geri Al" butonuna tıklayın',
                ]}
                height={295}
                showToolbar={true}
                data={allColumnsDemoData}
                columns={[
                  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
                  { id: 'code', title: 'Hesap Kodu', type: 'text', width: 140 },
                  { id: 'company', title: 'Şirket Adı', type: 'text', width: 200 },
                  { id: 'balance', title: 'Bakiye ($)', type: 'currency', width: 160, currencySymbol: '$' },
                  { id: 'status', title: 'Durum', type: 'select', width: 145, options: DOC_STATUS_OPTIONS },
                ]}
              />
            </div>

            <div id="batch-code">
              <CodeBlock
                id="batch-tr"
                title="Batch Edit Mode & Backend Transaction Commit"
                langBadge="TSX"
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
      e.cancel = true; // Hata durumunda yeşil vurgulu değişiklikler tabloda korunur
    }
  }}
/>`}
              />
            </div>
          </div>
        ),
        contentEn: (
          <div>
            <div id="batch-live">
              <LiveDemoBox
                title="Live Batch Save & CRUD Toolbar Playground"
                subtitle="Edit any cell or click '+ Add Row' in the toolbar: the green Save Batch and Discard buttons will appear automatically."
                hints={[
                  'Modify a few cells to see the green dirty highlight, then click "Save" or "Discard" in the toolbar',
                ]}
                height={295}
                showToolbar={true}
                data={allColumnsDemoData}
                columns={[
                  { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
                  { id: 'code', title: 'Account Code', type: 'text', width: 140 },
                  { id: 'company', title: 'Company Name', type: 'text', width: 200 },
                  { id: 'balance', title: 'Balance ($)', type: 'currency', width: 160, currencySymbol: '$' },
                  { id: 'status', title: 'Status', type: 'select', width: 145, options: DOC_STATUS_OPTIONS },
                ]}
              />
            </div>

            <div id="batch-code">
              <CodeBlock
                id="batch-en"
                title="Batch Edit Mode & Backend Transaction Commit"
                langBadge="TSX"
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
        ),
      },
      {
        id: 'theming-i18n',
        step: '9',
        badgeTr: 'TEMA & DİL (i18n)',
        badgeEn: 'THEMING & i18n',
        titleTr: 'Tema Motoru & Çoklu Dil (TR / EN)',
        titleEn: 'Theme Engine & Localization (i18n)',
        subtitleTr:
          '4 hazır kurumsal tema, özel tasarım belirteçleri (Design Tokens) ve tarayıcı dili algılama destekli i18n motoru.',
        subtitleEn:
          '4 built-in theme presets, custom design token overrides, and automatic browser language detection.',
        subItems: [
          { id: 'thm-code', labelTr: 'Hazır Temalar & Özel Token Kodu', labelEn: 'Theme Presets & Custom Tokens' },
        ],
        contentTr: (
          <div id="thm-code">
            <CodeBlock
              id="theme-i18n-tr"
              title="Theme Presets & Custom Token Overrides"
              langBadge="TSX"
              code={`import { SheetGL, LocaleEngine } from 'sheetgl';

// Tarayıcı dilini otomatik algılar ('tr' veya 'en', varsayılan 'en')
const defaultLang = LocaleEngine.detectBrowserLocaleCode();

<SheetGL
  dataSource={rows}
  columns={columns}
  locale={defaultLang === 'tr' ? 'tr-TR' : 'en-US'}
  // Hazır temalar: 'apple-dark' | 'apple-light' | 'google-dark' | 'google-light'
  theme={{
    name: 'custom-enterprise',
    isDark: true,
    canvas: {
      bg: '#090D16',
      selectionBorder: '#38BDF8',
    },
  }}
/>`}
            />
          </div>
        ),
        contentEn: (
          <div id="thm-code">
            <CodeBlock
              id="theme-i18n-en"
              title="Theme Presets & Custom Token Overrides"
              langBadge="TSX"
              code={`import { SheetGL, LocaleEngine } from 'sheetgl';

// Auto-detects browser language ('tr' or 'en', defaults to 'en')
const defaultLang = LocaleEngine.detectBrowserLocaleCode();

<SheetGL
  dataSource={rows}
  columns={columns}
  locale={defaultLang === 'tr' ? 'tr-TR' : 'en-US'}
  // Built-in presets: 'apple-dark' | 'apple-light' | 'google-dark' | 'google-light'
  theme={{
    name: 'custom-enterprise',
    isDark: true,
    canvas: {
      bg: '#090D16',
      selectionBorder: '#38BDF8',
    },
  }}
/>`}
            />
          </div>
        ),
      },
    ],
    [
      isDark,
      isTR,
      copiedCodeId,
      colCategoryFilter,
      colSearch,
      activeLiveColType,
      permModeDemo,
      cascadeLogs,
      allColumnsDemoData,
      validationPlaygroundCols,
      validationPlaygroundData,
      cascadePlaygroundCols,
      cascadePlaygroundData,
    ]
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
      {/* Top Navbar */}
      <header
        style={{
          height: 60,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.sidebarBg,
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            onClick={handleGoLanding}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <SheetGLLogo size={28} />
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
              SheetGL <span style={{ color: colors.accent }}>Docs</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoLanding}
            style={{
              padding: '6px 12px',
              borderRadius: 7,
              border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent',
              color: colors.muted,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isTR ? 'Ana Sayfa' : 'Home'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={onToggleLang}
            style={{
              padding: '6px 12px',
              borderRadius: 7,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isTR ? 'TR' : 'EN'}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              padding: '6px 12px',
              borderRadius: 7,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isDark ? (isTR ? '☀️ Açık' : '☀️ Light') : isTR ? '🌙 Koyu' : '🌙 Dark'}
          </button>

          <button
            type="button"
            onClick={handleGoStudio}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isTR ? 'Canlı Demo (10K Satır) →' : 'Full Demo (10K Rows) →'}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Navigation Sidebar */}
        <aside
          style={{
            width: 295,
            backgroundColor: colors.sidebarBg,
            borderRight: `1px solid ${colors.border}`,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTR ? 'Dokümantasyonda ara...' : 'Search documentation...'}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: 13.5,
              outline: 'none',
              marginBottom: 10,
              boxSizing: 'border-box',
            }}
          />

          {visibleSections.map((sec) => {
            const isActive = sec.id === activeSection.id;
            const isExpanded = Boolean(
              expandedSections[sec.id] || isActive || searchQuery.trim()
            );
            return (
              <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 9,
                    border: isActive ? `1px solid ${colors.accent}` : '1px solid transparent',
                    backgroundColor: isActive ? colors.accentBg : 'transparent',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectSection(sec.id)}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      padding: '10px 12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: isActive ? colors.accent : colors.text,
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      lineHeight: 1.35,
                    }}
                  >
                    {isTR ? sec.titleTr : sec.titleEn}
                  </button>
                  {sec.subItems.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedSections((prev) => ({
                          ...prev,
                          [sec.id]: !isExpanded,
                        }));
                      }}
                      title={isTR ? 'Alt başlıkları aç/kapat' : 'Toggle sub-headings'}
                      style={{
                        padding: '8px 10px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: isActive ? colors.accent : colors.muted,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {isExpanded ? '▾' : '▸'}
                    </button>
                  )}
                </div>

                {/* Nested Sub-Headings (Alt Başlıklar) */}
                {isExpanded && sec.subItems.length > 0 && (
                  <div
                    style={{
                      marginLeft: 14,
                      paddingLeft: 10,
                      borderLeft: `2px solid ${isActive ? colors.accent : colors.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      marginTop: 2,
                      marginBottom: 6,
                    }}
                  >
                    {sec.subItems.map((sub) => {
                      const isSubActive = isActive && activeSubId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectSubItem(sec.id, sub)}
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: isSubActive ? colors.accentBg : 'transparent',
                            color: isSubActive ? colors.accent : colors.muted,
                            fontSize: 12.5,
                            fontWeight: isSubActive ? 700 : 500,
                            cursor: 'pointer',
                            lineHeight: 1.35,
                          }}
                        >
                          {isTR ? sub.labelTr : sub.labelEn}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* Right Content Area */}
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
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                {isTR ? activeSection.titleTr : activeSection.titleEn}
              </h1>
              <p style={{ fontSize: 17, color: colors.muted, margin: 0, lineHeight: 1.6 }}>
                {isTR ? activeSection.subtitleTr : activeSection.subtitleEn}
              </p>
            </div>

            <div>{isTR ? activeSection.contentTr : activeSection.contentEn}</div>

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
