import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintObject, normalizeObjectValue, formatObjectSummary } from './ObjectPainter';
import { ObjectEditor } from './ObjectEditor';

export const ObjectColumnPlugin: IColumnTypePlugin<Record<string, any>> = {
  type: 'object',
  paint: paintObject,
  editorComponent: ObjectEditor,

  onPointerDown({ localX, column }) {
    if (localX > column.width - 26) {
      return { handled: true, shouldOpenEditor: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, openEditor }) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      openEditor();
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    return normalizeObjectValue(text);
  },

  formatClipboard(value) {
    const obj = normalizeObjectValue(value);
    return JSON.stringify(obj);
  },

  comparator(a, b) {
    const strA = formatObjectSummary(a);
    const strB = formatObjectSummary(b);
    return strA.localeCompare(strB, 'tr-TR');
  },
};
