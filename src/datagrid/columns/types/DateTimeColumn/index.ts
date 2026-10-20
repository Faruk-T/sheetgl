import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintDateTime } from './DateTimePainter';
import { DateTimeEditor } from './DateTimeEditor';

export const DateTimeColumnPlugin: IColumnTypePlugin<string> = {
  type: 'datetime',
  paint: paintDateTime,
  editorComponent: DateTimeEditor,

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
    const dmy = raw.match(
      /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/
    );
    if (dmy) {
      const hh = (dmy[4] || '09').padStart(2, '0');
      const mm = (dmy[5] || '00').padStart(2, '0');
      return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')} ${hh}:${mm}`;
    }
    return raw;
  },

  formatClipboard(value) {
    return value != null ? String(value) : '';
  },

  comparator(a, b) {
    const strA = String(a ?? '');
    const strB = String(b ?? '');
    return strA.localeCompare(strB);
  },
};
