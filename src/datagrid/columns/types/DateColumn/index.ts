import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintDate } from './DatePainter';
import { DateEditor } from './DateEditor';

export const DateColumnPlugin: IColumnTypePlugin<string> = {
  type: 'date',
  paint: paintDate,
  editorComponent: DateEditor,

  onPointerDown({ localX, column }) {
    if (localX > column.width - 28) {
      return { handled: true, shouldOpenEditor: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, openEditor }) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openEditor();
      return true;
    }
    if (/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openEditor(event.key);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const raw = text.trim();
    // Convert DD.MM.YYYY to YYYY-MM-DD if pasted in European format
    const dmy = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dmy) {
      return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }
    return raw;
  },

  formatClipboard(value) {
    return value != null ? String(value) : '';
  },

  comparator(a, b) {
    const timeA = a ? new Date(a).getTime() : 0;
    const timeB = b ? new Date(b).getTime() : 0;
    return timeA - timeB;
  },
};
