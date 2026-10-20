export type AppView = 'landing' | 'studio' | 'docs';

export interface RouteState {
  view: AppView;
  docSection?: string;
}

export function parseLocationPath(pathname: string): RouteState {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';

  if (clean === '/demo' || clean === '/studio') {
    return { view: 'studio' };
  }

  if (clean === '/documentation' || clean === '/docs') {
    return { view: 'docs', docSection: 'quickstart' };
  }

  if (clean.startsWith('/documentation/') || clean.startsWith('/docs/')) {
    const parts = clean.split('/').filter(Boolean);
    return { view: 'docs', docSection: parts[1] || 'quickstart' };
  }

  return { view: 'landing' };
}

export function buildRoutePath(view: AppView, docSection?: string): string {
  if (view === 'studio') return '/demo';
  if (view === 'docs') {
    return docSection && docSection !== 'quickstart'
      ? `/documentation/${docSection}`
      : '/documentation';
  }
  return '/';
}

export function syncSeoMeta(route: RouteState, lang: 'tr' | 'en'): void {
  if (typeof document === 'undefined') return;

  const isTR = lang === 'tr';
  document.documentElement.lang = isTR ? 'tr' : 'en';

  const path = buildRoutePath(route.view, route.docSection);
  const fullUrl = `https://sheetgl.dev${path === '/' ? '/' : path}`;

  let title = '';
  let description = '';

  if (route.view === 'studio') {
    title = isTR
      ? 'Canlı Demo Stüdyosu (10.000 Satır 60 FPS) | SheetGL Pro'
      : 'Live Demo Studio (10,000 Rows at 60 FPS) | SheetGL Pro';
    description = isTR
      ? 'SheetGL Pro canlı Excel DataGrid demosu: 14 sütun türü, Fill Handle çoğaltma, 3 katmanlı yetkilendirme, asenkron backend tetikleyicileri ve Batch Save.'
      : 'Interactive 10,000-row 60 FPS React Excel DataGrid live demo featuring 14 column types, Fill Handle, 3-tier permissions, async backend triggers, and Batch CRUD.';
  } else if (route.view === 'docs') {
    title = isTR
      ? 'Dokümantasyon & Hızlı Başlangıç Rehberi | SheetGL Pro'
      : 'Documentation & Quick Start Guide | SheetGL Pro';
    description = isTR
      ? 'SheetGL Pro React Excel DataGrid kurulumu, 14 sütun tipi, Excel kısayolları, yetkilendirme kuralları, olay yaşam döngüsü ve Batch Save dokümantasyonu.'
      : 'Complete developer documentation for SheetGL Pro: NPM/NPX setup, 14 column types, Excel shortcuts, RBAC permissions, lifecycle events, and Batch CRUD.';
  } else {
    title = isTR
      ? 'SheetGL Pro — React İçin 60 FPS WebGL & Canvas Excel DataGrid'
      : 'SheetGL Pro — 60 FPS WebGL & HTML5 Canvas Excel DataGrid for React';
    description = isTR
      ? 'Sıfır DOM şişkinliği ile 60 FPS hızında çalışan, Fill Handle, TSV Kopyala/Yapıştır, 14 sütun türü, asenkron backend senkronizasyonu ve Batch Save destekli React Excel DataGrid.'
      : 'SheetGL Pro is a 60 FPS WebGL & HTML5 Canvas Excel DataGrid for React featuring 14 built-in column types, Excel Fill Handle, TSV Copy/Paste, 3-tier permissions, and Batch CRUD.';
  }

  document.title = title;

  const setMeta = (selector: string, attr: string, val: string) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, val);
  };

  setMeta('meta[name="description"]', 'content', description);
  setMeta('#og-title', 'content', title);
  setMeta('#og-description', 'content', description);
  setMeta('#og-url', 'content', fullUrl);
  setMeta('#twitter-title', 'content', title);
  setMeta('#twitter-description', 'content', description);
  setMeta('#canonical-link', 'href', fullUrl);
}
