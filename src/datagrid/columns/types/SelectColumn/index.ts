import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintSelect } from './SelectPainter';
import { SelectEditor } from './SelectEditor';

export const SelectColumnPlugin: IColumnTypePlugin<string> = {
  type: 'select',
  paint: paintSelect,
  editorComponent: SelectEditor,

  onPointerDown({ localX, column }) {
    // Sağdaki ok alanına tıklandıysa doğrudan editörü aç
    if (localX > column.width - 24) {
      return { handled: true, shouldOpenEditor: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, openEditor }) {
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      openEditor(event.key);
      return true;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      openEditor();
      return true;
    }
    return false;
  },

  parseClipboard(text, column) {
    const clean = text.trim().toLowerCase();
    const match = column.options?.find(
      (o) => o.value.toLowerCase() === clean || o.label.toLowerCase() === clean
    );
    return match ? match.value : text;
  },

  formatClipboard(value, column) {
    const match = column.options?.find((o) => o.value === value);
    return match ? match.label : String(value ?? '');
  },

  comparator(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''), 'tr-TR');
  },
};
