import { CellPaintContext } from '../../IColumnTypePlugin';

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(localeCode: string, digits: number): Intl.NumberFormat {
  const key = `${localeCode}_${digits}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat(localeCode, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    } catch {
      fmt = new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    }
    formatters.set(key, fmt);
  }
  return fmt;
}

export function paintCurrency({ ctx, value, column, theme, locale, x, y, width, height }: CellPaintContext<number>): void {
  if (value === null || value === undefined || isNaN(Number(value))) return;

  const num = Number(value);
  const digits = column.decimalDigits ?? 2;
  const symbol = column.currencySymbol ?? '₺';
  const code = locale?.code || 'tr-TR';
  const isTR = code.startsWith('tr');
  const numStr = getFormatter(code, digits).format(num);
  const formatted = isTR
    ? `${numStr} ${symbol}`
    : num < 0
    ? `-${symbol}${numStr.replace(/^-/, '')}`
    : `${symbol}${numStr}`;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 6, y, width - 12, height);
  ctx.clip();

  ctx.fillStyle = num < 0 ? (theme.isDark ? '#FF453A' : '#DC2626') : theme.canvas.cellText;
  ctx.font = `500 ${theme.fontSize}px ${theme.fontFamily}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(formatted, x + width - 10, y + height / 2);

  ctx.restore();
}
