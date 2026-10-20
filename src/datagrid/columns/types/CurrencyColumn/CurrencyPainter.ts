import { CellPaintContext } from '../../IColumnTypePlugin';

const formatters = new Map<number, Intl.NumberFormat>();

function getFormatter(digits: number): Intl.NumberFormat {
  let fmt = formatters.get(digits);
  if (!fmt) {
    fmt = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formatters.set(digits, fmt);
  }
  return fmt;
}

export function paintCurrency({ ctx, value, column, theme, x, y, width, height }: CellPaintContext<number>): void {
  if (value === null || value === undefined || isNaN(Number(value))) return;

  const num = Number(value);
  const digits = column.decimalDigits ?? 2;
  const symbol = column.currencySymbol ?? '₺';
  const formatted = `${getFormatter(digits).format(num)} ${symbol}`;

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
