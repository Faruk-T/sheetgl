import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintProgress } from './ProgressPainter';
import { NumberEditor } from '../NumberColumn/NumberEditor';

export const ProgressColumnPlugin: IColumnTypePlugin<number> = {
  type: 'progress',
  paint: paintProgress,
  editorComponent: NumberEditor,

  onKeyDown({ event, openEditor }) {
    if (/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openEditor(event.key);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const num = parseFloat(text.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
  },

  formatClipboard(value) {
    return `${value ?? 0}%`;
  },

  comparator(a, b) {
    return (Number(a) || 0) - (Number(b) || 0);
  },
};
