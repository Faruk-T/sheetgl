import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintAction({ ctx, column, theme, x, y, width, height, isHovered }: CellPaintContext): void {
  const pad = 6;
  const btnH = 22;
  const btnY = y + (height - btnH) / 2;
  const btnW = width - pad * 2;
  if (btnW <= 10) return;

  ctx.save();

  // Buton arka planı
  ctx.fillStyle = isHovered
    ? theme.canvas.selectionBorder
    : theme.isDark
    ? '#2C2C2E'
    : '#F2F2F7';
  ctx.beginPath();
  ctx.roundRect(x + pad, btnY, btnW, btnH, 4);
  ctx.fill();

  // Buton çerçevesi
  ctx.strokeStyle = theme.isDark ? '#3A3A3C' : '#E5E5EA';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Buton metni
  ctx.fillStyle = isHovered ? '#FFFFFF' : theme.canvas.cellText;
  ctx.font = `500 11px ${theme.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(column.buttonText || 'İşlem', x + width / 2, y + height / 2);

  ctx.restore();
}
