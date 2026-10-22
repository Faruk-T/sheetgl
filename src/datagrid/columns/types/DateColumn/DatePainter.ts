import { CellPaintContext } from '../../IColumnTypePlugin';
import { FilterEngine } from '../../../core/FilterEngine';

export function paintDate({
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
    const dateStr = FilterEngine.formatLocalizedDate(value, locale?.code);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 8, y, Math.max(0, width - 30), height);
    ctx.clip();

    ctx.fillStyle = theme.canvas.cellText;
    ctx.font = `normal ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(dateStr, x + 8, y + height / 2);
    ctx.restore();
  }

  // Subtle Calendar Icon on right side of cell
  if (width > 60) {
    const iconX = x + width - 19;
    const iconY = y + height / 2 - 6;
    ctx.strokeStyle = isSelected || isHovered
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
