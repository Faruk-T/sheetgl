import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintDate({ ctx, value, theme, x, y, width, height }: CellPaintContext<string | Date>): void {
  if (!value) return;

  let dateStr = '';
  try {
    const d = typeof value === 'string' ? new Date(value) : value;
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const mon = String(d.getMonth() + 1).padStart(2, '0');
      const yr = d.getFullYear();
      dateStr = `${day}.${mon}.${yr}`;
    } else {
      dateStr = String(value);
    }
  } catch {
    dateStr = String(value);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 8, y, width - 16, height);
  ctx.clip();

  ctx.fillStyle = theme.canvas.cellText;
  ctx.font = `normal ${theme.fontSize}px ${theme.fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(dateStr, x + 8, y + height / 2);

  ctx.restore();
}
