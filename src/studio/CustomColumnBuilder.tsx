import React, { useState } from 'react';
import {
  COLUMN_COLOR_PRESET_LIST,
  ColumnColorPreset,
  ColumnDef,
  ColumnType,
  SelectOption,
} from '../datagrid';

export interface CustomColumnDefinitionMeta {
  columnDef: ColumnDef;
  autoFill: 'sample' | 'empty';
}

export interface CustomColumnBuilderProps {
  isDark: boolean;
  isTR: boolean;
  existingColumnIds: string[];
  customColumns: CustomColumnDefinitionMeta[];
  onAddCustomColumn: (meta: CustomColumnDefinitionMeta) => void;
  onRemoveCustomColumn: (colId: string) => void;
}

const ALL_COLUMN_TYPES: { type: ColumnType; labelTR: string; labelEN: string }[] = [
  { type: 'text', labelTR: 'Metin (Text)', labelEN: 'Text' },
  { type: 'number', labelTR: 'Sayı (Number)', labelEN: 'Number' },
  { type: 'currency', labelTR: 'Para Birimi (Currency)', labelEN: 'Currency ($/₺/€)' },
  { type: 'percent', labelTR: 'Yüzde (Percent %)', labelEN: 'Percent (%)' },
  { type: 'boolean', labelTR: 'Mantıksal (Boolean Checkbox)', labelEN: 'Boolean (Checkbox)' },
  { type: 'select', labelTR: 'Rozet Seçim (Select Badge)', labelEN: 'Select (Colored Badge)' },
  { type: 'dropdown', labelTR: 'Açılır Liste (Dropdown)', labelEN: 'Dropdown List' },
  { type: 'multiselect', labelTR: 'Çoklu Etiket (Multi-Select)', labelEN: 'Multi-Select Tags' },
  { type: 'lookup', labelTR: 'Katalog Arama (Lookup)', labelEN: 'Lookup (Subtitle)' },
  { type: 'progress', labelTR: 'İlerleme Çubuğu (Progress)', labelEN: 'Progress Bar (0-100)' },
  { type: 'rating', labelTR: 'Yıldız Derece (Rating 1-5)', labelEN: 'Star Rating (1-5)' },
  { type: 'date', labelTR: 'Tarih (Date)', labelEN: 'Date (YYYY-MM-DD)' },
  { type: 'datetime', labelTR: 'Tarih & Saat (DateTime)', labelEN: 'DateTime' },
  { type: 'time', labelTR: 'Saat (Time HH:mm)', labelEN: 'Time (HH:mm)' },
  { type: 'email', labelTR: 'E-Posta (Email)', labelEN: 'Email Address' },
  { type: 'url', labelTR: 'Web Bağlantısı (URL)', labelEN: 'Website URL' },
  { type: 'phone', labelTR: 'Telefon (Phone)', labelEN: 'Phone Number' },
  { type: 'color', labelTR: 'Renk Seçici (Color Hex)', labelEN: 'Color Picker' },
  { type: 'sparkline', labelTR: 'Mini Grafik (Sparkline)', labelEN: 'Sparkline Trend' },
  { type: 'object', labelTR: 'JSON Nesne (Object)', labelEN: 'JSON Object' },
  { type: 'action', labelTR: 'Aksiyon Butonu (Action)', labelEN: 'Action Button' },
];

const BADGE_PALETTES = [
  { bg: '#DCFCE7', fg: '#166534', darkBg: 'rgba(48, 209, 88, 0.18)', darkFg: '#4ADE80' },
  { bg: '#DBEAFE', fg: '#1E40AF', darkBg: 'rgba(59, 130, 246, 0.2)', darkFg: '#60A5FA' },
  { bg: '#FEF3C7', fg: '#92400E', darkBg: 'rgba(245, 158, 11, 0.2)', darkFg: '#FBBF24' },
  { bg: '#FEE2E2', fg: '#991B1B', darkBg: 'rgba(239, 68, 68, 0.2)', darkFg: '#F87171' },
  { bg: '#F3E8FF', fg: '#6B21A8', darkBg: 'rgba(168, 85, 247, 0.2)', darkFg: '#C084FC' },
];

export function generateCustomColumnSampleValue(col: ColumnDef, rowIndex: number): any {
  const opts = col.options && col.options.length > 0 ? col.options : undefined;
  switch (col.type) {
    case 'text':
      return `Özel Not #${rowIndex}`;
    case 'number':
      return (rowIndex * 17) % 500;
    case 'currency':
      return Math.round(((rowIndex * 345.6) % 25000) * 100) / 100;
    case 'percent':
      return Math.round(Math.sin(rowIndex) * 350) / 10;
    case 'boolean':
      return rowIndex % 2 === 0;
    case 'select':
    case 'dropdown':
    case 'lookup':
      return opts ? opts[rowIndex % opts.length].value : `Seçenek ${(rowIndex % 3) + 1}`;
    case 'multiselect':
      if (opts && opts.length >= 2) {
        return [opts[rowIndex % opts.length].value, opts[(rowIndex + 1) % opts.length].value];
      }
      return ['Etiket-A', 'Etiket-B'];
    case 'progress':
      return (rowIndex * 13) % 101;
    case 'rating':
      return (rowIndex % 5) + 1;
    case 'date':
      return `2025-0${(rowIndex % 9) + 1}-${String((rowIndex % 27) + 1).padStart(2, '0')}`;
    case 'datetime':
      return `2025-0${(rowIndex % 9) + 1}-${String((rowIndex % 27) + 1).padStart(2, '0')} 14:30`;
    case 'time':
      return `${String(9 + (rowIndex % 9)).padStart(2, '0')}:15`;
    case 'email':
      return `contact${rowIndex}@custom-domain.io`;
    case 'url':
      return `https://portal.sheetgl.io/item/${rowIndex}`;
    case 'phone':
      return `+90 (532) ${100 + (rowIndex % 899)}-${1000 + (rowIndex % 8999)}`;
    case 'color':
      return ['#38BDF8', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'][rowIndex % 5];
    case 'sparkline':
      return [15, 35, 28, 60, 45, 80, 92].map((v) => (v + rowIndex * 7) % 100);
    case 'object':
      return { departman: 'AR-GE', seviye: `L${(rowIndex % 4) + 1}`, kod: `CST-${rowIndex}` };
    case 'action':
      return undefined;
    default:
      return `Değer ${rowIndex}`;
  }
}

export const CustomColumnBuilder: React.FC<CustomColumnBuilderProps> = ({
  isDark,
  isTR,
  existingColumnIds,
  customColumns,
  onAddCustomColumn,
  onRemoveCustomColumn,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [title, setTitle] = useState<string>(isTR ? 'Risk Seviyesi' : 'Risk Level');
  const [customId, setCustomId] = useState<string>('');
  const [type, setType] = useState<ColumnType>('select');
  const [width, setWidth] = useState<number>(155);
  const [pinned, setPinned] = useState<'none' | 'left' | 'right'>('none');
  const [currencySymbol, setCurrencySymbol] = useState<string>('₺');
  const [optionsRaw, setOptionsRaw] = useState<string>(
    isTR ? 'Düşük, Orta, Yüksek, Kritik' : 'Low, Medium, High, Critical'
  );
  const [autoFill, setAutoFill] = useState<'sample' | 'empty'>('sample');
  const [headerGroup, setHeaderGroup] = useState<string>('financials');
  const [colorPreset, setColorPreset] = useState<ColumnColorPreset | ''>('rose');
  const [isRequired, setIsRequired] = useState<boolean>(false);
  const [isReadonly, setIsReadonly] = useState<boolean>(false);

  const cardBg = isDark ? '#1E293B' : '#F8FAFC';
  const inputBg = isDark ? '#0F172A' : '#FFFFFF';
  const subtleBorder = isDark ? '#334155' : '#CBD5E1';
  const textCol = isDark ? '#F9FAFB' : '#0F172A';
  const mutedText = isDark ? '#94A3B8' : '#64748B';

  const needsOptions =
    type === 'select' || type === 'dropdown' || type === 'multiselect' || type === 'lookup';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim() || (isTR ? 'Özel Sütun' : 'Custom Column');
    const baseSlug =
      (customId.trim() || cleanTitle)
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'custom_col';

    let finalId = baseSlug;
    let counter = 2;
    while (existingColumnIds.includes(finalId)) {
      finalId = `${baseSlug}_${counter++}`;
    }

    let parsedOptions: SelectOption[] | undefined;
    if (needsOptions) {
      const parts = optionsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const list = parts.length > 0 ? parts : ['Option A', 'Option B', 'Option C'];
      parsedOptions = list.map((item, idx) => {
        const pal = BADGE_PALETTES[idx % BADGE_PALETTES.length];
        return {
          value: item,
          label: item,
          subtitle: type === 'lookup' ? `Code #${idx + 1}` : undefined,
          ...pal,
        };
      });
    }

    const newCol: ColumnDef = {
      id: finalId,
      title: cleanTitle,
      type,
      width: Math.max(70, Math.min(360, Number(width) || 150)),
      pinned: pinned === 'none' ? undefined : pinned,
      groupId: headerGroup || undefined,
      color: colorPreset || undefined,
      sortable: true,
      filterable: true,
      groupable: true,
      readonly: isReadonly,
      permission: isReadonly ? 'readonly' : 'write',
      options: parsedOptions,
      currencySymbol: type === 'currency' ? currencySymbol || '$' : undefined,
      decimalDigits: type === 'currency' || type === 'percent' ? 2 : type === 'number' ? 0 : undefined,
      summaryType:
        type === 'currency' || type === 'number'
          ? 'sum'
          : type === 'percent' || type === 'progress' || type === 'rating'
          ? 'avg'
          : undefined,
      objectDisplayKey: type === 'object' ? 'departman' : undefined,
      buttonText: type === 'action' ? (isTR ? 'Çalıştır' : 'Trigger') : undefined,
      validationRules: isRequired
        ? [
            {
              type: 'required',
              message: isTR ? `${cleanTitle} alanı zorunludur.` : `${cleanTitle} is required.`,
            },
          ]
        : undefined,
    };

    onAddCustomColumn({
      columnDef: newCol,
      autoFill,
    });

    setTitle(isTR ? `Özel Sütun ${customColumns.length + 2}` : `Custom Field ${customColumns.length + 2}`);
    setCustomId('');
  };

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        backgroundColor: cardBg,
        border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>✨</span>
          <span style={{ fontWeight: 800, fontSize: 12, color: isDark ? '#DDD6FE' : '#6D28D9' }}>
            {isTR ? 'Özel Sütun Ekle (Custom Column Builder)' : 'Add Custom Column Builder'}
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: mutedText }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 6 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Sütun Başlığı *' : 'Column Title *'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isTR ? 'Örn: Kredi Limiti' : 'e.g. Credit Limit'}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Alan Kodu (ID)' : 'Field ID (Optional)'}
              </label>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder={isTR ? 'Otomatik' : 'Auto slug'}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {/* Column Type & Width */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: 6 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Sütun Veri Tipi (21 Tip)' : 'Column Data Type'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ColumnType)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              >
                {ALL_COLUMN_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {isTR ? t.labelTR : t.labelEN}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Genişlik (px)' : 'Width (px)'}
              </label>
              <input
                type="number"
                min={70}
                max={360}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              />
            </div>
          </div>

          {/* Options input for select / dropdown / multiselect / lookup */}
          {needsOptions && (
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Seçenekler (Virgülle Ayırın)' : 'Options (Comma-separated)'}
              </label>
              <input
                type="text"
                value={optionsRaw}
                onChange={(e) => setOptionsRaw(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              />
            </div>
          )}

          {/* Currency symbol if currency */}
          {type === 'currency' && (
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Para Birimi Sembolü' : 'Currency Symbol'}
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                style={{
                  width: 80,
                  padding: '5px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              />
            </div>
          )}

          {/* Pinning & Initial Data Fill */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Sabitleme (Pin)' : 'Pin Column'}
              </label>
              <select
                value={pinned}
                onChange={(e) => setPinned(e.target.value as 'none' | 'left' | 'right')}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              >
                <option value="none">{isTR ? 'Serbest (Yok)' : 'None'}</option>
                <option value="left">{isTR ? 'Sola Sabitle (Left)' : 'Pin Left'}</option>
                <option value="right">{isTR ? 'Sağa Sabitle (Right)' : 'Pin Right'}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Satır Verisi' : 'Initial Row Data'}
              </label>
              <select
                value={autoFill}
                onChange={(e) => setAutoFill(e.target.value as 'sample' | 'empty')}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              >
                <option value="sample">{isTR ? 'Örnek Veri Üret' : 'Generate Samples'}</option>
                <option value="empty">{isTR ? 'Boş Başlat (Null)' : 'Start Empty (Null)'}</option>
              </select>
            </div>
          </div>

          {/* Column Group & Theme-Aware Color Preset */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Sütun Grubu (Header Group)' : 'Column Group'}
              </label>
              <select
                value={headerGroup}
                onChange={(e) => setHeaderGroup(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              >
                <option value="">{isTR ? 'Grupsuz (Tam Boy)' : 'No Group (Full Height)'}</option>
                <option value="identity">{isTR ? 'Kimlik & Hesap' : 'Account Identity'}</option>
                <option value="organization">{isTR ? 'Organizasyon & Bölge' : 'Organization & Region'}</option>
                <option value="financials">{isTR ? 'Finansal Metrikler' : 'Financial Metrics'}</option>
                <option value="performance">{isTR ? 'Performans & Trend' : 'Performance & KPI'}</option>
                <option value="timeline">{isTR ? 'Zaman & Denetim' : 'Timeline & Audit'}</option>
                <option value="contact">{isTR ? 'İletişim & Aksiyon' : 'Contact & Actions'}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: mutedText, marginBottom: 3 }}>
                {isTR ? 'Sütun Rengi (Dark/Light)' : 'Column Color (Dark/Light)'}
              </label>
              <select
                value={colorPreset}
                onChange={(e) => setColorPreset(e.target.value as ColumnColorPreset | '')}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: `1px solid ${subtleBorder}`,
                  backgroundColor: inputBg,
                  color: textCol,
                  fontSize: 11.5,
                }}
              >
                <option value="">{isTR ? 'Grup Rengini Miras Al' : 'Inherit Group Color'}</option>
                {COLUMN_COLOR_PRESET_LIST.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isTR ? p.labelTR : p.labelEN} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes: Required & Readonly */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
              />
              <span>{isTR ? 'Zorunlu Alan (Required)' : 'Required Validation'}</span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isReadonly}
                onChange={(e) => setIsReadonly(e.target.checked)}
              />
              <span>{isTR ? 'Salt Okunur (Readonly)' : 'Read-Only'}</span>
            </label>
          </div>

          <button
            type="submit"
            style={{
              marginTop: 2,
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)',
            }}
          >
            + {isTR ? 'Tabloya Özel Sütun Ekle' : 'Add Custom Column to Grid'}
          </button>
        </form>
      )}

      {/* List of user-created custom columns */}
      {customColumns.length > 0 && (
        <div
          style={{
            marginTop: 4,
            paddingTop: 8,
            borderTop: `1px solid ${subtleBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: mutedText }}>
            {isTR
              ? `Eklenen Özel Sütunlar (${customColumns.length}):`
              : `Added Custom Columns (${customColumns.length}):`}
          </div>
          {customColumns.map(({ columnDef }) => (
            <div
              key={columnDef.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                borderRadius: 6,
                backgroundColor: inputBg,
                border: `1px solid ${subtleBorder}`,
                fontSize: 11.5,
              }}
            >
              <div>
                <strong>{columnDef.title}</strong>{' '}
                <span style={{ fontSize: 10, color: mutedText, fontFamily: 'monospace' }}>
                  ({columnDef.id} • {columnDef.type})
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveCustomColumn(columnDef.id)}
                style={{
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.14)',
                  color: '#F87171',
                  borderRadius: 5,
                  padding: '2px 7px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isTR ? 'Kaldır' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
