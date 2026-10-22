import { CellPaintContext } from '../../IColumnTypePlugin';

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(localeCode: string, minDigits: number, maxDigits: number, useGrouping: boolean = true): Intl.NumberFormat {
  const key = `${localeCode}_${minDigits}_${maxDigits}_${useGrouping}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat(localeCode, {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
        useGrouping,
      });
    } catch {
      fmt = new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
        useGrouping,
      });
    }
    formatters.set(key, fmt);
  }
  return fmt;
}

export function paintNumber({ ctx, value, column, theme, locale, x, y, width, height }: CellPaintContext<number>): void {
  if (value === null || value === undefined || value === ('' as any) || isNaN(Number(value))) return;

  const num = Number(value);
  const code = locale?.code || 'tr-TR';
  let formatted: string;

  if (column.id === 'id') {
    formatted = String(Math.trunc(num));
  } else if (column.decimalDigits !== undefined) {
    formatted = getFormatter(code, column.decimalDigits, column.decimalDigits, true).format(num);
  } else if (Number.isInteger(num)) {
    formatted = getFormatter(code, 0, 0, true).format(num);
  } else {
    formatted = getFormatter(code, 0, 2, true).format(num);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 6, y, width - 12, height);
  ctx.clip();

  ctx.fillStyle = num < 0 ? (theme.isDark ? '#FF453A' : '#DC2626') : theme.canvas.cellText;
  ctx.font = `normal ${theme.fontSize}px ${theme.fontFamily}`;
  ctx.textAlign = column.align || 'right';
  const textX = column.align === 'center' ? x + width / 2 : column.align === 'left' ? x + 10 : x + width - 10;
  ctx.textBaseline = 'middle';
  ctx.fillText(formatted, textX, y + height / 2);

  ctx.restore();
}
