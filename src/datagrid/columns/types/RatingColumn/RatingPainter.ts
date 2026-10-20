import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintRating({ ctx, value, theme, x, y, width, height }: CellPaintContext<number>): void {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  const starCount = 5;
  const starSize = 13;
  const gap = 3;
  const startX = x + 8;
  const midY = y + height / 2;

  ctx.save();
  for (let i = 0; i < starCount; i++) {
    const sx = startX + i * (starSize + gap);
    if (sx + starSize > x + width) break;

    const isFilled = i < rating;
    ctx.fillStyle = isFilled ? '#F59E0B' : theme.isDark ? '#48484A' : '#D1D1D6';

    // 5 köşeli vektörel yıldız çizimi
    drawStar(ctx, sx + starSize / 2, midY, 5, starSize / 2, starSize / 4);
    ctx.fill();
  }
  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}
