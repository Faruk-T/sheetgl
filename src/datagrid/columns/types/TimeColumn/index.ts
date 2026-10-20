import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintTime } from './TimePainter';
import { TimeEditor } from './TimeEditor';

export const TimeColumnPlugin: IColumnTypePlugin<string> = {
  type: 'time',
  paint: paintTime,
  editorComponent: TimeEditor,

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
    return text.trim();
  },

  formatClipboard(value) {
    return value != null ? String(value) : '';
  },

  comparator(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''));
  },
};
