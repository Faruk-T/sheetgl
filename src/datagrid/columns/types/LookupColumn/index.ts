import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintLookup } from './LookupPainter';
import { LookupEditor } from './LookupEditor';

export const LookupColumnPlugin: IColumnTypePlugin<string> = {
  type: 'lookup',
  paint: paintLookup,
  editorComponent: LookupEditor,

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
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openEditor(event.key);
      return true;
    }
    return false;
  },

  parseClipboard(text, column) {
    const clean = text.trim().toLowerCase();
    const match = column.options?.find(
      (o) => o.value.toLowerCase() === clean || o.label.toLowerCase() === clean
    );
    return match ? match.value : text.trim();
  },

  formatClipboard(value, column) {
    const match = column.options?.find((o) => o.value === value);
    return match ? match.label : String(value ?? '');
  },

  comparator(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''), 'tr-TR');
  },
};
