import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintCurrency } from './CurrencyPainter';
import { NumberEditor } from '../NumberColumn/NumberEditor';

export const CurrencyColumnPlugin: IColumnTypePlugin<number> = {
  type: 'currency',
  paint: paintCurrency,
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

  formatClipboard(value, column) {
    const sym = column.currencySymbol ?? '₺';
    return value != null ? `${value} ${sym}` : '';
  },

  comparator(a, b) {
    return (Number(a) || 0) - (Number(b) || 0);
  },
};
