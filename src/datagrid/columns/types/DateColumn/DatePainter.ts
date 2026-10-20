import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintDate({
  ctx,
  value,
  theme,
  x,
  y,
  width,
  height,
  isHovered,
  isSelected,
}: CellPaintContext<string | Date>): void {
  ctx.save();

  if (value) {
    let dateStr = '';
    try {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        const [yr, mon, day] = value.slice(0, 10).split('-');
        dateStr = `${day}.${mon}.${yr}`;
      } else {
        const d = typeof value === 'string' ? new Date(value) : value;
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const mon = String(d.getMonth() + 1).padStart(2, '0');
          const yr = d.getFullYear();
          dateStr = `${day}.${mon}.${yr}`;
        } else {
          dateStr = String(value);
        }
      }
    } catch {
      dateStr = String(value);
    }

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
