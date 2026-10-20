import { CellPaintContext } from '../../IColumnTypePlugin';

function getInitials(label: string): string {
  const parts = label.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return label.slice(0, 2).toUpperCase();
}

export function paintLookup({
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
}: CellPaintContext<string>): void {
  const rawVal = value != null ? String(value) : '';
  if (!rawVal) return;

  const opt = column.options?.find((o) => String(o.value) === rawVal) || {
    value: rawVal,
    label: rawVal,
  };

  ctx.save();
  const centerY = y + height / 2;
  const avatarR = 10;
  const avatarCX = x + 8 + avatarR;

  // 1. Draw Circular Avatar Badge
  const avatarBg = theme.isDark
    ? opt.darkBg || 'rgba(139, 92, 246, 0.25)'
    : opt.bg || '#EDE9FE';
  const avatarFg = theme.isDark ? opt.darkFg || '#C4B5FD' : opt.fg || '#5B21B6';

  ctx.fillStyle = avatarBg;
  ctx.beginPath();
  ctx.arc(avatarCX, centerY, avatarR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = avatarFg;
  ctx.font = `700 9.5px ${theme.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getInitials(opt.label), avatarCX, centerY);

  // 2. Draw Primary Display Label + Subtitle clipped
  const textX = avatarCX + avatarR + 7;
  const maxTextW = width - (textX - x) - 22;

  if (maxTextW > 16) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(textX, y, maxTextW, height);
    ctx.clip();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${theme.fontSize - 1}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.canvas.cellText;
    ctx.fillText(opt.label, textX, centerY);

    if (opt.subtitle) {
      const labelW = ctx.measureText(opt.label).width;
      ctx.font = `400 ${theme.fontSize - 2.5}px ${theme.fontFamily}`;
      ctx.fillStyle = theme.isDark ? '#94A3B8' : '#64748B';
      ctx.fillText(` · ${opt.subtitle}`, textX + labelW, centerY);
    }

    ctx.restore();
  }

  // 3. Draw Chevron
  ctx.fillStyle =
    isSelected || isHovered
      ? theme.dom.accentColor
      : theme.isDark
      ? '#64748B'
      : '#94A3B8';
  ctx.beginPath();
  const arrowX = x + width - 11;
  ctx.moveTo(arrowX - 3.5, centerY - 2);
  ctx.lineTo(arrowX + 3.5, centerY - 2);
  ctx.lineTo(arrowX, centerY + 2.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
