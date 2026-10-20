import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintDate } from './DatePainter';
import { DateEditor } from './DateEditor';

export const DateColumnPlugin: IColumnTypePlugin<string> = {
  type: 'date',
  paint: paintDate,
  editorComponent: DateEditor,

  onKeyDown({ event, openEditor }) {
    if (event.key === 'Enter' || event.key === ' ') {
      openEditor();
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
    const timeA = a ? new Date(a).getTime() : 0;
    const timeB = b ? new Date(b).getTime() : 0;
    return timeA - timeB;
  },
};
