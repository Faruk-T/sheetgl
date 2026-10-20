import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintProgress({ ctx, value, theme, x, y, width, height }: CellPaintContext<number>): void {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const pad = 6;
  const barH = 18;
  const barY = y + (height - barH) / 2;
  const barTotalW = width - pad * 2;
  const fillW = (barTotalW * pct) / 100;

  ctx.save();

  // Arka plan rayı (Track)
  ctx.fillStyle = theme.isDark ? '#2C2C2E' : '#E5E5EA';
  ctx.beginPath();
  ctx.roundRect(x + pad, barY, barTotalW, barH, 4);
  ctx.fill();

  // Doluluk barı (Fill)
  if (fillW > 0) {
    const isCompleted = pct === 100;
    ctx.fillStyle = isCompleted ? '#10B981' : theme.canvas.selectionBorder;
    ctx.beginPath();
    ctx.roundRect(x + pad, barY, fillW, barH, 4);
    ctx.fill();
  }

  // Yüzde metni
  ctx.fillStyle = pct > 55 ? '#FFFFFF' : theme.canvas.cellText;
  ctx.font = `600 11px ${theme.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`%${pct}`, x + width / 2, y + height / 2);

  ctx.restore();
}
