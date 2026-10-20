import { CellPaintContext } from '../../IColumnTypePlugin';
import { NumberEditor } from '../NumberColumn/NumberEditor';
import { IColumnTypePlugin } from '../../IColumnTypePlugin';

export function paintPercent({
  ctx,
  value,
  column,
  theme,
  locale,
  x,
  y,
  width,
  height,
}: CellPaintContext<number>): void {
  if (value === null || value === undefined || value === ('' as any)) return;
  const num = Number(value);
  if (isNaN(num)) return;

  const digits = column.decimalDigits ?? 1;
  const formatted = num.toLocaleString(locale.code, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  const showSign = column.showVarianceSign ?? true;
  const signPrefix = showSign && num > 0 ? '+' : '';
  const arrow = showSign ? (num > 0 ? '▲ ' : num < 0 ? '▼ ' : '') : '';
  const text = `${arrow}${signPrefix}${formatted}%`;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 6, y, width - 12, height);
  ctx.clip();

  if (showSign && num > 0) {
    ctx.fillStyle = theme.isDark ? '#34D399' : '#059669';
  } else if (showSign && num < 0) {
    ctx.fillStyle = theme.isDark ? '#F87171' : '#DC2626';
  } else {
    ctx.fillStyle = theme.canvas.cellText;
  }

  ctx.font = `600 ${theme.fontSize}px ${theme.fontFamily}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width - 10, y + height / 2);
  ctx.restore();
}

export const PercentColumnPlugin: IColumnTypePlugin<number> = {
  type: 'percent',
  paint: paintPercent,
  editorComponent: NumberEditor,

  onKeyDown({ event, openEditor }) {
    if (/^[0-9.,+-]$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      openEditor(event.key);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const clean = text.replace(/[%▲▼+\s]/g, '').replace(',', '.');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  },

  formatClipboard(value) {
    const n = Number(value);
    return isNaN(n) ? '0%' : `${n}%`;
  },

  comparator(a, b) {
    return (Number(a) || 0) - (Number(b) || 0);
  },
};
