import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintSparkline({ ctx, value, column, theme, x, y, width, height }: CellPaintContext<number[]>): void {
  const points: number[] = Array.isArray(value) ? value : [];
  if (points.length < 2) return;

  const padX = 8;
  const padY = 8;
  const w = width - padX * 2;
  const h = height - padY * 2;
  if (w <= 0 || h <= 0) return;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + padX, y, w, height);
  ctx.clip();

  ctx.strokeStyle = column.sparklineColor || theme.canvas.selectionBorder;
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  points.forEach((val, i) => {
    const px = x + padX + (i / (points.length - 1)) * w;
    const py = y + height - padY - ((val - min) / range) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Son noktanın üzerine minik nokta koy
  const lastVal = points[points.length - 1];
  const lastX = x + padX + w;
  const lastY = y + height - padY - ((lastVal - min) / range) * h;
  ctx.fillStyle = column.sparklineColor || theme.canvas.selectionBorder;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
