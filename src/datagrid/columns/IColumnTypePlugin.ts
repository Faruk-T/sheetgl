import React from 'react';
import { ColumnDef } from '../types/grid';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';

export interface CellPaintContext<T = any> {
  ctx: CanvasRenderingContext2D;
  value: T;
  column: ColumnDef;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered: boolean;
}

export interface CellHitTestResult {
  handled: boolean;
  shouldOpenEditor?: boolean;
}

export interface CellEditorProps<T = any> {
  value: T;
  column: ColumnDef;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  rect: { x: number; y: number; width: number; height: number };
  initialChar?: string;
  onCommit: (newValue: T, moveDirection?: 'down' | 'right' | 'left' | 'none') => void;
  onCancel: () => void;
}

export interface IColumnTypePlugin<TValue = any> {
  readonly type: string;

  // 1. Canvas Çizimi
  paint(context: CellPaintContext<TValue>): void;

  // 2. Mikro-DOM Editör Bileşeni (Opsiyonel)
  editorComponent?: React.ComponentType<CellEditorProps<TValue>>;

  // 3. Doğrudan Canvas Tıklama / Hit-Test
  onPointerDown?(params: {
    localX: number;
    localY: number;
    value: TValue;
    column: ColumnDef;
    setValue: (val: TValue) => void;
  }): CellHitTestResult;

  // 4. Doğrudan Hücrede Klavye Kısayolları
  onKeyDown?(params: {
    event: React.KeyboardEvent;
    value: TValue;
    column: ColumnDef;
    setValue: (val: TValue) => void;
    openEditor: (char?: string) => void;
  }): boolean;

  // 5. Excel / TSV Pano Dönüştürücüsü
  parseClipboard?(text: string, column: ColumnDef): TValue;
  formatClipboard?(value: TValue, column: ColumnDef): string;

  // 6. Sıralama Karşılaştırıcısı
  comparator?(a: TValue, b: TValue): number;
}
