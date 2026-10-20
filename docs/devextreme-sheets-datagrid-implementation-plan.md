# WebGL & Canvas Excel DataGrid Mimari Uygulama Planı (SheetGL Pro)
## Kapsamlı Mimari & Teknik Uygulama Şartnamesi (Technical Implementation Specification)

Bu doküman; kurumsal veri tablosu yeteneklerini (Gelişmiş Filtreleme, Çoklu Sıralama, Çok Seviyeli Gruplama, Sütun Boyutlandırma/Yeniden Sıralama, Özet Satırları ve **Tam Kapsamlı Remote Operations / Static In-Memory Hibrit Desteği**) **WebGL & HTML5 Canvas**'ın sıfır gecikmeli, 60 FPS 2D sanallaştırma motoruyla birleştiren, **SOLID Prensiplerine %100 Sadık**, **Her Sütun Tipinin Ayrı Dosyada Modüler Olduğu**, **Google & Apple Tasarım Diliyle Uyumlu Dark/Light Tema Sistemine Sahip** ve **tamamen lisanssız (Zero-License & Zero-Dependency Core)** bir React + TypeScript DataGrid mimarisinin detaylı uygulama planıdır.

---

## 1. Mimari Karşılaştırma & Tasarım Felsefesi

| Yetenek / Metrik | Geleneksel DOM Grid (DevExtreme, MUI X, AG-Grid) | Google Sheets / DataGridXL | **SheetGL Pro (Hedef Mimarimiz)** |
| :--- | :--- | :--- | :--- |
| **Render Katmanı** | Binlerce `<div>`, `<td>`, `<tr>` DOM elementi | Tek bir HTML5 `<canvas>` elementi | **Hibrit**: Canvas 2D Viewport + Micro DOM Overlays |
| **Veri Kaynağı (Data Source)** | Sadece Local veya Ayrı Remote Eklentileri | Sabit tekil bellek deposu | **Evrensel Çift Mod (Universal Hybrid)**: Hem Static Array hem Remote REST/GraphQL |
| **50+ Sütun & 100K-1M Satır** | DOM şişmesi (DOM bloat), bellek sızıntısı | 60 FPS akıcılık (bellekte sınırlı) | **60 FPS Sabit**: 2D Prefix-Sum & Infinite Block Virtualization |
| **Gruplama (Grouping)** | Ağır DOM hiyerarşisi, DOM ağacı kilitlenir | Basit pivot (ayrı sayfada) | **Sanal Grup Projeksiyonu**: İstemcide 0ms Toggle, Sunucuda Kademeli Lazy-Group |
| **Sütun Modülarizasyonu** | Monolitik veya karmaşık switch-case blokları | Dahili sabit tipler | **Ayrık Modüler Eklentiler (Per-Column Plugin)**: Her tip bağımsız klasörde |
| **Tasarım & Tema Dili** | Klasik kutusal kurumsal temalar | Google Sheets sade arayüzü | **Apple HIG (Glassmorphism & SF Pro) + Google Sheets Keskinliği** |
| **Yazılım Mimarisi** | Monolitik veya Framework bağımlı | Kapalı kaynak monolit | **SOLID Prensipleri**: Pluggable Registry, Decoupled Core, ISP, DIP |
| **Lisans Maliyeti** | Geliştirici başına $800 - $2.500+ / Yıl | Kapalı kaynak / Ticari | **%100 Açık / Şirket İçi Özkaynak (MIT/Lisanssız)** |

---

## 2. SOLID Yazılım Prensipleri ve Somut Kod Mimarisi

Sistemin bakımı kolay, test edilebilir ve genişletilebilir olması için 5 temel SOLID prensibi mimarinin her katmanına doğrudan uygulanmıştır:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        S - SINGLE RESPONSIBILITY                       │
│  GeometryEngine  │  CanvasRenderer  │  FilterEngine  │ GroupingEngine  │
│ (Yalnız Geometri)│ (Yalnız Çizim)   │ (Yalnız Filtre)│ (Yalnız Ağaç)   │
├────────────────────────────────────────────────────────────────────────┤
│                         O - OPEN / CLOSED                              │
│  ColumnTypeRegistry.register(SelectColumnPlugin) | addFilterOperator() │
│     (Yeni özellikler eklenirken var olan çekirdek koda DOKUNULMAZ)     │
├────────────────────────────────────────────────────────────────────────┤
│                       L - LISKOV SUBSTITUTION                          │
│   LocalDataStore <═══ IDataStore ═══> RemoteDataStore (Tak-Çalıştır)   │
│         (UI ve Renderer veri kaynağının türünden bağımsızdır)          │
├────────────────────────────────────────────────────────────────────────┤
│                      I - INTERFACE SEGREGATION                         │
│  IReadableStore │ IMutableStore │ IFilterableStore │ IGroupableStore   │
│    (İstemci kullanmadığı devasa tek parça arayüze zorlanmaz)           │
├────────────────────────────────────────────────────────────────────────┤
│                       D - DEPENDENCY INVERSION                         │
│    DataGrid Core ────► [IDataStore / IThemeEngine Soyutlamaları]       │
│    (Somut fetch / DOM yerine dependency injection kullanılır)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modüler Sütun Tipi Eklenti Mimarisi (Per-Column-Type Plugin Architecture)

Her sütun tipi kendi bağımsız dizininde barınan, **kendi çizicisini (Painter), mikro-DOM editörünü (Editor), hit-test mantığını, klavye dinleyicisini ve pano formatlayıcısını** içeren tam teşekküllü bir **Eklenti (Plugin)** olarak tasarlanır:

### 3.1. Standart Sütun Eklentisi Sözleşmesi (`IColumnTypePlugin.ts`)

```typescript
export interface CellPaintContext<T = any> {
  ctx: CanvasRenderingContext2D;
  value: T;
  column: ColumnDef;
  theme: IGridThemeTokens; // Temaya göre Canvas çizimi
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered: boolean;
}

export interface CellHitTestResult {
  handled: boolean;           // True ise varsayılan seçimi engeller (Örn: checkbox tıklandı)
  shouldOpenEditor?: boolean; // Tıklama editörü açmalı mı? (Örn: Select okuna tıklandı)
}

export interface CellEditorProps<T = any> {
  value: T;
  column: ColumnDef;
  theme: IGridThemeTokens;
  rect: { x: number; y: number; width: number; height: number };
  initialChar?: string;
  onCommit: (newValue: T, moveDirection?: 'down' | 'right' | 'left' | 'none') => void;
  onCancel: () => void;
}

export interface IColumnTypePlugin<TValue = any> {
  readonly type: string;

  // 1. Canvas Çizimi (Retina/DPI uyumlu, tema duyarlı)
  paint(context: CellPaintContext<TValue>): void;

  // 2. Mikro-DOM Editör Bileşeni (Boolean ve Rating gibi tiplerde null dönebilir)
  editorComponent?: React.ComponentType<CellEditorProps<TValue>>;

  // 3. Doğrudan Canvas Üzerinde Tıklama / Hit-Test (Zero-DOM Checkbox, Rating yıldızları vb.)
  onPointerDown?(params: {
    localX: number;
    localY: number;
    value: TValue;
    column: ColumnDef;
    setValue: (val: TValue) => void;
  }): CellHitTestResult;

  // 4. Doğrudan Hücrede Klavye Kısayolları (Space ile toggle, 1-5 rating, First-key capture)
  onKeyDown?(params: {
    event: React.KeyboardEvent;
    value: TValue;
    column: ColumnDef;
    setValue: (val: TValue) => void;
    openEditor: (char?: string) => void;
  }): boolean;

  // 5. Excel / TSV Pano Dönüştürücüsü (Smart Coercion)
  parseClipboard?(text: string, column: ColumnDef): TValue;
  formatClipboard?(value: TValue, column: ColumnDef): string;

  // 6. Sıralama Karşılaştırıcısı
  comparator?(a: TValue, b: TValue): number;
}
```

---

## 4. Premium Tema Sistemi: Google Workspace & Apple SF Tasarım Dili

SheetGL Pro; **Google Sheets'in keskin, net ve odaklı grid ergonomisini** Apple'ın **macOS / iOS Human Interface Guidelines (SF Pro tipografisi, yarı saydam cam efekti - Glassmorphism, zarif gölgeler ve yumuşak mikromasyonlar)** ile harmanlar.

### 4.1. Çift Köprülü Tema Mimarisi (The Dual-Bridge Theme Engine)
HTML5 Canvas piksel tabanlı çalıştığından CSS değişkenlerini (`var(--bg)`) doğrudan yorumlayamaz. Bu nedenle `ThemeEngine`, **hem CSS Değişkenlerini (DOM arayüzleri için)** hem de **JavaScript Renk Tokenlarını (Canvas render döngüsü için)** tek bir kaynaktan üretir:

```
                          ┌──────────────────────────┐
                          │       ThemeEngine        │
                          │   'apple-dark' | 'light' │
                          └─────────────┬────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌──────────────────────────────┐              ┌──────────────────────────────────────┐
│   CSS Değişkenleri (DOM)     │              │    JavaScript Theme Tokens (Canvas)  │
│  --grid-bg: #1C1C1E;         │              │  theme.canvas.gridLine = '#2C2C2E'   │
│  --glass-blur: blur(20px);   │              │  theme.canvas.selection = '#0A84FF'  │
│  (Formül barı, popover, edit)│              │  (Tüm Canvas çizim döngüsü kullanır) │
└──────────────────────────────┘              └──────────────────────────────────────┘
```

---

### 4.2. Tema Token Şeması (`IGridThemeTokens`)

```typescript
export interface IGridThemeTokens {
  name: 'apple-light' | 'apple-dark' | 'google-light' | 'google-dark' | string;
  isDark: boolean;

  // 1. Tipografi
  fontFamily: string; // '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
  fontSize: number;   // 13
  headerFontSize: number; // 12
  fontFeatureSettings: string; // 'tnum' (Tabular Rakamlar: Hizalama bozulmaz)

  // 2. Canvas Renkleri (Doğrudan ctx.fillStyle / strokeStyle ile kullanılır)
  canvas: {
    bg: string;
    gridLine: string;
    headerBg: string;
    headerText: string;
    headerBorder: string;
    cellText: string;
    rowNumberBg: string;
    rowNumberText: string;
    rowNumberBorder: string;
    frozenDividerShadow: string;
    groupRowBg: string;
    groupRowText: string;
    selectionBorder: string;
    selectionFill: string;
    fillHandleColor: string;
    searchHighlight: string;
    skeletonBar: string;
  };

  // 3. DOM & Glassmorphism Stilleri (Toolbar, Formül Çubuğu, Popover)
  dom: {
    toolbarBg: string;
    toolbarBorder: string;
    glassBackdrop: string; // 'blur(20px) saturate(180%)'
    popoverBg: string;
    popoverBorder: string;
    popoverShadow: string;
    inputBg: string;
    inputText: string;
    inputFocusBorder: string;
    accentColor: string;
  };
}
```

---

### 4.3. Hazır Tema Önayarları (Presets)

#### 1. `apple-light` (macOS Tahoe / Sonoma Aydınlık Teması)
* **Zemin:** Saf beyaz (`#FFFFFF`) ve hafif açık gri başlıklar (`#F5F5F7`).
* **Seçim & Vurgu:** Apple SF Mavisi (`#007AFF`), seçim dolgusu `rgba(0, 122, 255, 0.08)`.
* **Izgara Çizgileri:** İnce, göz yormayan ayırıcılar (`#E5E5EA`).
* **Glassmorphism:** Popover ve üst çubuklarda `rgba(255, 255, 255, 0.75)` + `backdrop-filter: blur(20px)`.

#### 2. `apple-dark` (macOS Derin Koyu Mod)
* **Zemin:** Apple Pro Dark (`#1C1C1E`), başlıklar (`#2C2C2E`).
* **Seçim & Vurgu:** Neon SF Mavisi (`#0A84FF`), seçim dolgusu `rgba(10, 132, 255, 0.15)`.
* **Izgara Çizgileri:** Koyu nötr çizgiler (`#38383A`).
* **Metin:** Keskin beyaz (`#FFFFFF`) ve ikincil gri (`#8E8E93`).
* **Glassmorphism:** `rgba(30, 30, 32, 0.8)` + `backdrop-filter: blur(24px)`.

#### 3. `google-light` (Google Sheets Klasik & Modern Hibriti)
* **Zemin:** `#FFFFFF`, başlıklar (`#F8F9FA`).
* **Seçim & Vurgu:** Google Workspace Yeşili (`#107C41`) veya Google Mavisi (`#1A73E8`).
* **Izgara Çizgileri:** `#E0E0E0`.
* **Formül Çubuğu:** Tipik Sheets `fx` ergonomisi.

#### 4. `google-dark` (Google Workspace Gece Modu)
* **Zemin:** Google Nötr Koyu (`#202124`), başlıklar (`#2D2E30`).
* **Seçim & Vurgu:** `#8AB4F8`.
* **Izgara Çizgileri:** `#3C4043`.

#### 5. `system` (İşletim Sistemine Canlı Duyarlı)
* `window.matchMedia('(prefers-color-scheme: dark)')` dinlenerek kullanıcı işletim sistemini Dark'a aldığında **tek bir kare gecikme olmaksızın Canvas ve DOM aynı anda** renk değiştirir.

---

### 4.4. Kullanıcı / Geliştirici Kullanımı

```tsx
import { SheetGL, Themes } from '@sheetgl/react';

// Otomatik Sistem Teması ile Çalıştırma
<SheetGL
  dataSource={data}
  columns={columns}
  theme="system" // veya 'apple-dark' | 'apple-light' | 'google-light' | 'google-dark'
/>

// Özel Kurumsal Tema ile Çalıştırma
const customBankTheme = Themes.create('bank-dark', {
  extend: 'apple-dark',
  canvas: {
    selectionBorder: '#10B981', // Zümrüt Yeşili
    selectionFill: 'rgba(16, 185, 129, 0.12)'
  }
});

<SheetGL
  dataSource={data}
  columns={columns}
  theme={customBankTheme}
/>
```

---

## 5. Evrensel Çift Modlu Veri Kaynağı (Static vs. Remote)

### 5.1. Kullanım Örnekleri

```tsx
// KULLANIM SENARYOSU 1: Statik Veri (Frontend In-Memory - 100.000 Satır)
const localStore = new LocalDataStore({
  data: myProductsArray,
  keyField: 'id'
});

<DataGrid 
  store={localStore}
  columns={columns}
  theme="apple-dark"
/>

// KULLANIM SENARYOSU 2: Sunucu Taraflı Veri (Backend Remote Operations - Milyonlarca Satır)
const remoteStore = new RemoteDataStore({
  url: 'https://api.sirketiniz.com/faturalar',
  keyField: 'id',
  remoteOperations: {
    paging: true,
    filtering: true,
    sorting: true,
    grouping: true,
    summary: true
  }
});

<DataGrid 
  store={remoteStore}
  columns={columns}
  theme="apple-dark"
/>
```

---

## 6. Çok Seviyeli Gruplama (Grouping) Mimarisi

### 6.1. Sanal Satır Yansıtması (Flattened Virtual Row Projection)
Gruplama uygulandığında sistem satırları iç içe DOM nesnelerine bölmez; tek boyutlu `VirtualRow[]` projeksiyonu üzerinden Canvas'ta boyar:

```typescript
export type VirtualRow = 
  | {
      type: 'group';
      level: number;              // 0: Ana grup, 1: Alt grup
      groupKey: string;           // 'Elektronik'
      field: string;              // 'kategori'
      value: any;
      rowCount: number;           // Gruptaki toplam satır adedi (örn: 1420)
      isExpanded: boolean;        // Açık mı kapalı mı?
      summaries?: Record<string, number>; // Grup içi toplamlar: { ciro: 1450000 }
    }
  | {
      type: 'data';
      rawIndex: number;           // Orijinal satır indeksi
      data: Record<string, any>;  // Hücre verisi
    };
```

---

## 7. Standart REST JSON İletişim Protokolü (Query DTO)

### 7.1. Sunucu İstek Formatı (Request Payload)
```json
{
  "skip": 0,
  "take": 50,
  "requireTotalCount": true,
  "sort": [
    { "selector": "sehir", "desc": false },
    { "selector": "bakiye", "desc": true }
  ],
  "filter": [
    ["durum", "=", "Aktif"],
    "and",
    [
      ["bakiye", ">=", 1000],
      "or",
      ["cariAdi", "contains", "Holding"]
    ]
  ],
  "group": [
    { "selector": "kategori", "isExpanded": false }
  ],
  "groupSummary": [
    { "selector": "bakiye", "summaryType": "sum" }
  ],
  "totalSummary": [
    { "selector": "bakiye", "summaryType": "sum" },
    { "selector": "id", "summaryType": "count" }
  ],
  "searchExpr": ["cariAdi", "vergiNo"],
  "searchOperation": "contains",
  "searchValue": "ACME"
}
```

### 7.2. Sunucu Yanıt Formatı (Response Payload)
```json
{
  "data": [
    { "id": 101, "cariAdi": "ACME Holding", "sehir": "İstanbul", "bakiye": 254000.50, "durum": "Aktif" }
  ],
  "totalCount": 184520,
  "summary": [ 458923000.50, 184520 ]
}
```

---

## 8. Sonsuz Sanal Kaydırma & Blok Önbellek (Infinite Block Virtualization)

1. **Sanal Yükseklik:** Sunucuda 1.000.000 kayıt olduğunda sanal kaydırma çubuğu `1.000.000 × 34px = 34.000.000px` yüksekliğe ayarlanır.
2. **LRU Page Cache:** İstemcide son kullanılan 25-30 blok tutulur. Eski bloklar otomatik temizlenir; bellek asla taşmaz.
3. **Debounced Fetching & AbortController:** Hızlı kaydırma sırasında ara sayfa istekleri `abort()` edilerek gereksiz HTTP trafiği önlenir.
4. **Canvas Skeleton Loader:** Verisi henüz sunucudan gelmemiş hücreler için parlayan hafif gri iskelet çubuklar çizilir.

---

## 9. Sütun Yönetimi & Excel Etkileşimleri

1. **Sütun Genişletme & Sığdırma (Resize & Auto-Fit):**
   - Çift tıklandığında `ctx.measureText()` ile içeriğe tam oturan genişlik hesabı.
2. **Sütun Sıralama & Sabitleme (Reorder & Frozen Left/Right):**
   - Sol ve sağa sabitlenen sütunlar yatay kaydırmadan etkilenmez.
3. **Hücre Alanı Seçimi & Doldurma Tutamacı (Range Selection & Fill Handle):**
   - Mavi dikdörtgen seçim çerçevesi, sağ alttaki kareden sürükleyerek çoğaltma.
4. **Excel Uyumlu Kopyala/Yapıştır (`Ctrl+C` / `Ctrl+V`):**
   - TSV panosu ile Excel ve Google Sheets arasında çift yönlü veri kopyalama.
5. **Geri Al / Yinele (Undo / Redo):**
   - Command pattern ile hücre değişiklik geçmişi.

---

## 10. Tam Modüler Klasör Yapısı

```
src/components/DataGrid/
├── core/
│   ├── GeometryEngine.ts          // S: Yalnızca koordinat, prefix-sum ve hit-test geometrisi
│   ├── VirtualIndexPipeline.ts    // S: In-memory Int32Array indeks filtreleme ve sıralama
│   ├── GroupingEngine.ts          // S: Sanal grup ağacı ve yansıtma motoru (VirtualRow[])
│   ├── FilterEngine.ts            // S: AST Filtre operatörleri ve dönüştürücüler
│   ├── SelectionModel.ts          // S: Tekil ve alan seçimi (Range Selection)
│   ├── HistoryManager.ts          // S: Undo / Redo komut yığını (Command Pattern)
│   └── types/
│       ├── grid.ts                // Sütun, hücre ve UI tipleri
│       ├── store.ts               // IDataStore arayüzü ve LoadOptions DTO'ları
│       ├── group.ts               // Grup hiyerarşi ve sanal satır tipleri
│       └── filter.ts              // AST Filtre operatör tanımları
├── theme/                         // APPLE & GOOGLE DUAL-BRIDGE TEMA SİSTEMİ
│   ├── IGridTheme.ts              // Tema sözleşmesi ve token tipleri
│   ├── ThemeEngine.ts             // Canvas & CSS değişken köprüsü + system auto-detect
│   └── presets/
│       ├── appleLight.ts          // macOS Sonoma Açık Tema
│       ├── appleDark.ts           // macOS Pro Koyu Mod Tema
│       ├── googleLight.ts         // Google Sheets Klasik Tema
│       └── googleDark.ts          // Google Workspace Gece Modu
├── columns/                       // HER SÜTUN TİPİ AYRI BAĞIMSIZ MODÜL
│   ├── IColumnTypePlugin.ts       // Standart Sütun Eklenti Sözleşmesi
│   ├── ColumnTypeRegistry.ts      // Merkezi eklenti kayıt motoru
│   └── types/
│       ├── TextColumn/
│       │   ├── index.ts           // TextColumnPlugin tanımları
│       │   ├── TextPainter.ts     // Canvas metin çizici & kırpıcı
│       │   └── TextEditor.tsx     // React input overlay editörü
│       ├── NumberColumn/
│       │   ├── index.ts
│       │   ├── NumberPainter.ts   // Sağa hizalı binlik ayraçlı çizici
│       │   └── NumberEditor.tsx
│       ├── CurrencyColumn/
│       │   ├── index.ts
│       │   ├── CurrencyPainter.ts // ₺ / $ / € sembol formatlı çizici
│       │   └── CurrencyEditor.tsx
│       ├── BooleanColumn/
│       │   ├── index.ts           // Zero-DOM Checkbox (Doğrudan canvas toggle & Space)
│       │   └── BooleanPainter.ts
│       ├── SelectColumn/
│       │   ├── index.ts           // Renkli rozet & açılır ok hit-test
│       │   ├── SelectPainter.ts
│       │   └── SelectEditor.tsx   // Aramalı Combobox overlay
│       ├── MultiSelectColumn/
│       │   ├── index.ts
│       │   ├── MultiSelectPainter.ts
│       │   └── MultiSelectEditor.tsx
│       ├── DateColumn/
│       │   ├── index.ts
│       │   ├── DatePainter.ts
│       │   └── DateEditor.tsx     // Takvim popover editörü
│       ├── ProgressColumn/
│       │   ├── index.ts
│       │   └── ProgressPainter.ts // Hücre içi dinamik doluluk barı
│       ├── RatingColumn/
│       │   ├── index.ts           // Zero-DOM 5 Yıldız (Hit-test ile tıkla-puanla & 1-5 tuşları)
│       │   └── RatingPainter.ts
│       ├── SparklineColumn/
│       │   ├── index.ts           // Mini satır içi çizgi grafik
│       │   └── SparklinePainter.ts
│       └── ActionColumn/
│           ├── index.ts           // Satır işlem butonları (Sil, Detay, PDF)
│           └── ActionPainter.ts
├── data/
│   ├── LocalDataStore.ts          // L, D: İstemci tarafı yüksek hızlı veri deposu
│   ├── RemoteDataStore.ts         // L, D: Sunucu tarafı REST/JSON veri adaptörü
│   ├── BlockCache.ts              // S: LRU Page / Block önbellek yöneticisi
│   └── GridWorker.worker.ts       // Ağır filtreleme/sıralama için Web Worker
├── renderer/
│   ├── CanvasRenderer.ts          // S: 60 FPS ana render döngüsü ve 2D sanallaştırma
│   ├── GroupRowPainter.ts         // S: Hiyerarşik grup başlığı ve ara toplam çizicisi
│   └── SkeletonPainter.ts         // S: Remote yükleme esnasında iskelet çizici
├── overlays/
│   ├── DynamicCellEditor.tsx      // ColumnTypeRegistry'den ilgili editörü dinamik bindirir
│   ├── HeaderFilterPopover.tsx    // Excel tarzı checkbox filtre menüsü (Local & Remote)
│   ├── ColumnChooserModal.tsx     // Sütun gizleme/gösterme menüsü
│   └── ContextMenu.tsx            // Sağ tık menüsü (Kopyala, Yapıştır, Satır Ekle/Sil)
├── ui/
    ├── DataGrid.tsx               // Ana React bileşeni (Container)
    ├── FormulaBar.tsx             // Formül ve koordinat çubuğu
    ├── FilterRow.tsx              // Başlık altı hızlı filtre satırı
    ├── SummaryFooter.tsx          // Alt toplam ve özet satırı
    └── ToolBar.tsx                // Arama kutusu, kolon seçici, export butonları
```

---

## 11. Uygulama Yol Haritası (Implementation Milestones)

### Aşama 1: SOLID Çekirdek, Tema Motoru ve Çift Modlu Store (Hafta 1)
- [x] Canvas 2D render iskeleti ve HiDPI Retina uyumluluğu.
- [x] Prefix-Sum X/Y `GeometryEngine` motoru ve Binary Search ile görünür hücre tespiti.
- [ ] `ThemeEngine` (Dual-Bridge: Canvas Tokens + CSS Variables) ve `apple-light`, `apple-dark`, `google-light`, `google-dark` hazır temaları.
- [ ] `IColumnTypePlugin` sözleşmesi ve `ColumnTypeRegistry` kayıt motoru.
- [ ] İlk modüler sütun tipleri: `TextColumn`, `NumberColumn`, `BooleanColumn` (Zero-DOM).
- [ ] `IDataStore` arayüzü ve `LocalDataStore` (Int32Array pointer) implementasyonu.
- [ ] `RemoteDataStore` ve LRU Block Cache ile sunucu taraflı sayfalama (skip/take).

### Aşama 2: Zengin Sütun Tipleri ve Mikro-DOM Editörleri (Hafta 2)
- [ ] `SelectColumn` (Renkli rozetler ve aramalı Combobox overlay).
- [ ] `MultiSelectColumn` (Yan yana rozetler ve çoklu seçim menüsü).
- [ ] `DateColumn` (Tarih formatlama ve takvim popover).
- [ ] `RatingColumn` (Hit-test ile doğrudan tıklama ve 1-5 rakam tuşları).
- [ ] `ProgressColumn` ve `SparklineColumn` mini grafik çizicileri.

### Aşama 3: Gruplama (Grouping), Filtreleme ve Sıralama Hattı (Hafta 3)
- [ ] `GroupingEngine`: Static modda sanal satır yansıtması (`VirtualRow[]`) ve 0ms expand/collapse.
- [ ] Remote modda kademeli sunucu gruplaması (Lazy-Load Grouping) ve grup özetleri.
- [ ] Canvas üzerinde grup başlığı çizimi (`GroupRowPainter`) ve ok tıklama hit-testi.
- [ ] Çoklu sütun sıralama (`Shift + Tık` desteği ve uzaktan `sort` DTO).
- [ ] Excel tarzı Header Filter Popover (Local Set & Remote Distinct API).
- [ ] Başlık altı Filter Row ve genel arama (Global Search highlight).

### Aşama 4: Sütun Operasyonları & Excel Etkileşimi (Hafta 4)
- [ ] Sütun boyutlandırma (Resize) ve çift tıkla otomatik sığdırma (Auto-fit).
- [ ] Sütun yer değiştirme (Drag & Drop column reorder).
- [ ] Alan seçimi (Range Selection - fare ve klavye ile).
- [ ] Excel/Sheets uyumlu TSV kopyala-yapıştır (`Ctrl+C`, `Ctrl+V`).
- [ ] Geri al / Yinele (Undo/Redo) komut motoru.

### Aşama 5: Remote Batch CRUD, Özet Satırı ve Kurumsal Özellikler (Hafta 5)
- [ ] Alt toplam şeridi (`SUM`, `AVG`, `COUNT` - Local hesaplama & Remote `summary` DTO).
- [ ] Toplu kaydetme (Batch Save) ve CRUD operasyonları (`inserted`, `updated`, `deleted`).
- [ ] Excel (.xlsx) ve CSV dışa aktarma modülü.
- [ ] 500.000 satır static veri ve 1.000.000 satır remote veri stres testleri (60 FPS doğrulama).
