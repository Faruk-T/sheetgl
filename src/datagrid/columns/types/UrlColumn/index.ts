import { CellPaintContext, IColumnTypePlugin } from '../../IColumnTypePlugin';
import { TextEditor } from '../TextColumn/TextEditor';

export function paintUrl({
  ctx,
  value,
  theme,
  x,
  y,
  width,
  height,
  isHovered,
}: CellPaintContext<string>): void {
  const raw = value != null ? String(value).trim() : '';
  if (!raw) return;

  const display = raw.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  const centerY = y + height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 6, y, width - 26, height);
  ctx.clip();

  ctx.fillStyle = theme.isDark ? '#38BDF8' : '#0284C7';
  ctx.font = `500 ${theme.fontSize - 1}px ${theme.fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(display, x + 8, centerY);

  if (isHovered) {
    const textW = Math.min(ctx.measureText(display).width, width - 34);
    ctx.strokeStyle = theme.isDark ? '#38BDF8' : '#0284C7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, centerY + 7);
    ctx.lineTo(x + 8 + textW, centerY + 7);
    ctx.stroke();
  }
  ctx.restore();

  // Draw external link launch icon on right
  ctx.save();
  ctx.fillStyle = isHovered ? theme.dom.accentColor : theme.isDark ? '#64748B' : '#94A3B8';
  ctx.font = `700 11px ${theme.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('↗', x + width - 12, centerY);
  ctx.restore();
}

export const UrlColumnPlugin: IColumnTypePlugin<string> = {
  type: 'url',
  paint: paintUrl,
  editorComponent: TextEditor,

  onPointerDown({ localX, column, value }) {
    if (localX > column.width - 24 && value) {
      const href = /^https?:\/\//i.test(String(value))
        ? String(value)
        : `https://${String(value)}`;
      if (typeof window !== 'undefined') {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
      return { handled: true, shouldOpenEditor: false };
    }
    return { handled: false };
  },

  onKeyDown({ event, openEditor }) {
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openEditor(event.key);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    return text.trim();
  },

  formatClipboard(value) {
    return String(value ?? '');
  },

  comparator(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''), 'tr-TR');
  },
};
