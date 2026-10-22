import { CellPaintContext } from '../../IColumnTypePlugin';
import { FilterEngine } from '../../../core/FilterEngine';

export function formatDateTimeDisplay(
  value: string | Date,
  localeCode: string = 'tr-TR'
): { datePart: string; timePart: string } {
  if (!value) return { datePart: '', timePart: '' };
  const parsed = FilterEngine.parseDateParts(value);
  if (parsed) {
    const hh = String(parsed.hasTime ? parsed.hour : 9).padStart(2, '0');
    const mm = String(parsed.hasTime ? parsed.minute : 0).padStart(2, '0');
    return {
      datePart: FilterEngine.formatLocalizedDate(value, localeCode),
      timePart: `${hh}:${mm}`,
    };
  }
  return { datePart: String(value), timePart: '' };
}

export function paintDateTime({
  ctx,
  value,
  theme,
  locale,
  x,
  y,
  width,
  height,
  isHovered,
  isSelected,
}: CellPaintContext<string | Date>): void {
  ctx.save();

  if (value) {
    const { datePart, timePart } = formatDateTimeDisplay(value, locale?.code);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 8, y, Math.max(0, width - 30), height);
    ctx.clip();

    ctx.fillStyle = theme.canvas.cellText;
    ctx.font = `normal ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(datePart, x + 8, y + height / 2);

    if (timePart) {
      const dateW = ctx.measureText(datePart).width;
      const pillX = x + 14 + dateW;
      const pillH = 18;
      const pillY = y + (height - pillH) / 2;

      ctx.font = `600 ${theme.fontSize - 2}px monospace`;
      const timeW = ctx.measureText(timePart).width + 10;

      ctx.fillStyle = theme.isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.09)';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, timeW, pillH, 4);
      ctx.fill();

      ctx.fillStyle = theme.isDark ? '#38BDF8' : '#0284C7';
      ctx.fillText(timePart, pillX + 5, y + height / 2);
    }

    ctx.restore();
  }

  // Calendar + Clock Icon on right side of cell
  if (width > 70) {
    const iconX = x + width - 19;
    const iconY = y + height / 2 - 6;
    ctx.strokeStyle =
      isSelected || isHovered
        ? theme.dom.accentColor
        : theme.isDark
        ? 'rgba(255,255,255,0.35)'
        : 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(iconX, iconY + 1, 11, 10);
    ctx.beginPath();
    ctx.moveTo(iconX, iconY + 4);
    ctx.lineTo(iconX + 11, iconY + 4);
    ctx.moveTo(iconX + 3, iconY - 1);
    ctx.lineTo(iconX + 3, iconY + 2);
    ctx.moveTo(iconX + 8, iconY - 1);
    ctx.lineTo(iconX + 8, iconY + 2);
    ctx.stroke();
  }

  ctx.restore();
}
