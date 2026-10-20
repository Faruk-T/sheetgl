import { CellPaintContext, IColumnTypePlugin } from '../../IColumnTypePlugin';
import { TextEditor } from '../TextColumn/TextEditor';

export function paintPhone({
  ctx,
  value,
  theme,
  x,
  y,
  width,
  height,
}: CellPaintContext<string>): void {
  const phone = value != null ? String(value).trim() : '';
  if (!phone) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 6, y, width - 12, height);
  ctx.clip();

  const centerY = y + height / 2;

  ctx.fillStyle = theme.isDark ? '#34D399' : '#059669';
  ctx.font = `600 11px ${theme.fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('☎', x + 8, centerY);

  ctx.fillStyle = theme.canvas.cellText;
  ctx.font = `500 ${theme.fontSize - 1}px monospace`;
  ctx.fillText(phone, x + 24, centerY);

  ctx.restore();
}

export const PhoneColumnPlugin: IColumnTypePlugin<string> = {
  type: 'phone',
  paint: paintPhone,
  editorComponent: TextEditor,

  onKeyDown({ event, openEditor }) {
    if (/^[0-9+()-\s]$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
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
