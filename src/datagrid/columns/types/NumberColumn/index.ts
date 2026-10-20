import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintNumber } from './NumberPainter';
import { NumberEditor } from './NumberEditor';

export const NumberColumnPlugin: IColumnTypePlugin<number> = {
  type: 'number',
  paint: paintNumber,
  editorComponent: NumberEditor,

  onKeyDown({ event, openEditor }) {
    if (/^[0-9.,-]$/.test(event.key)) {
      openEditor(event.key);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const clean = text.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  },

  formatClipboard(value) {
    return value != null ? String(value) : '';
  },

  comparator(a, b) {
    return (Number(a) || 0) - (Number(b) || 0);
  },
};
