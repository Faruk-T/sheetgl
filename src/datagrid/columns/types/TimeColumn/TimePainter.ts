import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintTime({
  ctx,
  value,
  theme,
  x,
  y,
  width,
  height,
  isHovered,
  isSelected,
}: CellPaintContext<string>): void {
  ctx.save();

  if (value) {
    const str = String(value).trim();

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 8, y, Math.max(0, width - 30), height);
    ctx.clip();

    ctx.fillStyle = theme.canvas.cellText;
    ctx.font = `600 ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x + 8, y + height / 2);
    ctx.restore();
  }

  // Subtle Clock Icon on right side of cell
  if (width > 55) {
    const cx = x + width - 14;
    const cy = y + height / 2;
    const r = 5.5;

    ctx.strokeStyle =
      isSelected || isHovered
        ? theme.dom.accentColor
        : theme.isDark
        ? 'rgba(255,255,255,0.38)'
        : 'rgba(0,0,0,0.38)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Clock hands
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 3.2);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 2.6, cy + 1.2);
    ctx.stroke();
  }

  ctx.restore();
}
