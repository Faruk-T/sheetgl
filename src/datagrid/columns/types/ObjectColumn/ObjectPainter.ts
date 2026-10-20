import { CellPaintContext } from '../../IColumnTypePlugin';

export function normalizeObjectValue(value: any): Record<string, any> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return {};
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Fallback to key:value parser below
      }
    }
    const out: Record<string, any> = {};
    const pairs = trimmed.split(/[,;|]/);
    for (const pair of pairs) {
      const idx = pair.indexOf(':');
      if (idx > 0) {
        const k = pair.slice(0, idx).trim();
        const rawV = pair.slice(idx + 1).trim();
        if (k) {
          if (rawV === 'true') out[k] = true;
          else if (rawV === 'false') out[k] = false;
          else if (rawV !== '' && !isNaN(Number(rawV))) out[k] = Number(rawV);
          else out[k] = rawV;
        }
      }
    }
    if (Object.keys(out).length > 0) return out;
    return { value: trimmed };
  }
  return { value };
}

export function formatObjectSummary(value: any, displayKey?: string): string {
  const obj = normalizeObjectValue(value);
  const entries = Object.entries(obj);
  if (entries.length === 0) return '';

  if (displayKey && obj[displayKey] !== undefined) {
    const primary = String(obj[displayKey]);
    const rest = entries
      .filter(([k]) => k !== displayKey)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(' • ');
    return rest ? `${primary} (${rest})` : primary;
  }

  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(' • ');
}

export function paintObject({
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
}: CellPaintContext<Record<string, any>>): void {
  const obj = normalizeObjectValue(value);
  const entries = Object.entries(obj);

  ctx.save();
  const pad = 8;
  const centerY = y + height / 2;

  // 1. Draw {N} Object Badge
  const badgeText = `{${entries.length}}`;
  ctx.font = `700 ${theme.fontSize - 3}px monospace`;
  const badgeW = Math.max(24, ctx.measureText(badgeText).width + 10);
  const badgeH = 18;
  const badgeX = x + pad;
  const badgeY = centerY - badgeH / 2;

  ctx.fillStyle = theme.isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.1)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
  ctx.fill();

  ctx.strokeStyle = theme.isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = theme.isDark ? '#38BDF8' : '#0284C7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + badgeW / 2, centerY);

  // 2. Draw Key-Value Summary Text clipped
  const textStartX = badgeX + badgeW + 7;
  const maxTextW = width - (textStartX - x) - 24;

  if (maxTextW > 16 && entries.length > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(textStartX, y, maxTextW, height);
    ctx.clip();

    const summary = formatObjectSummary(obj, column.objectDisplayKey);
    ctx.font = `500 ${theme.fontSize - 1}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.canvas.cellText;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(summary, textStartX, centerY);
    ctx.restore();
  }

  // 3. Draw Inspector Icon on right
  ctx.fillStyle =
    isSelected || isHovered
      ? theme.dom.accentColor
      : theme.isDark
      ? '#64748B'
      : '#94A3B8';
  ctx.font = `700 11px ${theme.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⤢', x + width - 12, centerY);

  ctx.restore();
}
