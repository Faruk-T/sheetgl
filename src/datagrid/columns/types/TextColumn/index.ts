import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintText } from './TextPainter';
import { TextEditor } from './TextEditor';

export const TextColumnPlugin: IColumnTypePlugin<string> = {
  type: 'text',
  paint: paintText,
  editorComponent: TextEditor,

  onKeyDown({ event, openEditor }) {
    // First-key capture: Klavyeden herhangi bir harfe basıldığında editörü doğrudan o harfle aç
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
    return value != null ? String(value) : '';
  },

  comparator(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''), 'tr-TR', { numeric: true });
  },
};
