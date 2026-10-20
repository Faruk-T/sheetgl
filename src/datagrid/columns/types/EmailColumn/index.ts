import { CellPaintContext, IColumnTypePlugin } from '../../IColumnTypePlugin';
import { TextEditor } from '../TextColumn/TextEditor';

export function paintEmail({
  ctx,
  value,
  theme,
  x,
  y,
  width,
  height,
}: CellPaintContext<string>): void {
  const email = value != null ? String(value).trim() : '';
  if (!email) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 6, y, width - 12, height);
  ctx.clip();

  const centerY = y + height / 2;

  // Draw mail icon badge
  ctx.fillStyle = theme.isDark ? '#38BDF8' : '#0284C7';
  ctx.font = `600 12px ${theme.fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('✉', x + 8, centerY);

  // Draw email text
  ctx.fillStyle = theme.canvas.cellText;
  ctx.font = `500 ${theme.fontSize - 1}px ${theme.fontFamily}`;
  ctx.fillText(email, x + 26, centerY);

  ctx.restore();
}

export const EmailColumnPlugin: IColumnTypePlugin<string> = {
  type: 'email',
  paint: paintEmail,
  editorComponent: TextEditor,

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
