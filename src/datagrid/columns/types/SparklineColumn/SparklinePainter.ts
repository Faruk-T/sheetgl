import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintSparkline({
  ctx,
  value,
  column,
  theme,
  x,
  y,
  width,
  height,
  isHovered,
  isSelected,
}: CellPaintContext<number[]>): void {
  const points: number[] = Array.isArray(value) ? value : [];
  if (points.length < 2) return;

  const padX = 8;
  const rightReserve = isHovered || isSelected ? 26 : 10;
  const padY = 8;
  const w = width - padX - rightReserve;
  const h = height - padY * 2;
  if (w <= 0 || h <= 0) return;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + padX, y, w + 4, height);
  ctx.clip();

  const strokeColor = column.sparklineColor || theme.canvas.selectionBorder;
  ctx.strokeStyle = strokeColor;
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
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Hover veya seçili durumda sağda "Detaylı Grafik Modalı Aç (↗)" ikonu göster
  if (isHovered || isSelected) {
    ctx.save();
    const btnSize = 18;
    const btnX = x + width - btnSize - 4;
    const btnY = y + (height - btnSize) / 2;

    ctx.fillStyle = theme.isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.12)';
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnSize, btnSize, 4);
    ctx.fill();

    ctx.fillStyle = theme.dom.accentColor;
    ctx.font = `700 11px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↗', btnX + btnSize / 2, btnY + btnSize / 2);
    ctx.restore();
  }
}
