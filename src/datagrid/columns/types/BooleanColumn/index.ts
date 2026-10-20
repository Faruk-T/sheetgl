import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintBoolean } from './BooleanPainter';

export const BooleanColumnPlugin: IColumnTypePlugin<boolean> = {
  type: 'boolean',
  paint: paintBoolean,
  editorComponent: undefined, // Zero-DOM: DOM açmadan doğrudan canvas üstünden çalışır

  onPointerDown({ value, setValue }) {
    setValue(!value);
    return { handled: true };
  },

  onKeyDown({ event, value, setValue }) {
    if (event.key === ' ') {
      event.preventDefault();
      setValue(!value);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const clean = text.trim().toLowerCase();
    return ['true', '1', 'evet', 'aktif', 'yes'].includes(clean);
  },

  formatClipboard(value) {
    return value ? 'DOĞRU' : 'YANLIŞ';
  },

  comparator(a, b) {
    return (a === b ? 0 : a ? 1 : -1);
  },
};
