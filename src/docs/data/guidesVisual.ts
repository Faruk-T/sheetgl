import { ColumnGuideItem } from '../types';

export const VISUAL_GUIDES: ColumnGuideItem[] = [
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
