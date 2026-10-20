import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintBoolean({ ctx, value, theme, x, y, width, height }: CellPaintContext<boolean>): void {
  const size = 16;
  const boxX = Math.round(x + (width - size) / 2);
  const boxY = Math.round(y + (height - size) / 2);

  ctx.save();
  ctx.lineWidth = 1.5;

  if (value) {
    ctx.fillStyle = theme.canvas.selectionBorder;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, size, size, 3);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(boxX + 3.5, boxY + 8);
    ctx.lineTo(boxX + 6.5, boxY + 11.5);
    ctx.lineTo(boxX + 12.5, boxY + 4.5);
    ctx.stroke();
  } else {
    ctx.strokeStyle = theme.isDark ? '#5A5A5E' : '#C7C7CC';
    ctx.fillStyle = theme.canvas.bg;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, size, size, 3);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
