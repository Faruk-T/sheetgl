import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintCurrency } from './CurrencyPainter';
import { NumberEditor } from '../NumberColumn/NumberEditor';

export const CurrencyColumnPlugin: IColumnTypePlugin<number> = {
  type: 'currency',
  paint: paintCurrency,
  editorComponent: NumberEditor,

  onKeyDown({ event, openEditor }) {
    if (/^[0-9.,-]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openEditor(event.key);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const clean = text.trim();
    // Handle both US (12,345.67) and TR/EU (12.345,67) formats gracefully
    if (clean.includes(',') && clean.includes('.')) {
      const lastComma = clean.lastIndexOf(',');
      const lastDot = clean.lastIndexOf('.');
      if (lastComma > lastDot) {
        const num = parseFloat(clean.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? 0 : num;
      } else {
        const num = parseFloat(clean.replace(/,/g, '').replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? 0 : num;
      }
    } else if (clean.includes(',')) {
      const num = parseFloat(clean.replace(',', '.').replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? 0 : num;
    }
    const num = parseFloat(clean.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  },

  formatClipboard(value, column) {
    const sym = column.currencySymbol ?? '$';
    return value != null ? `${value} ${sym}` : '';
  },

  comparator(a, b) {
    return (Number(a) || 0) - (Number(b) || 0);
  },
};
