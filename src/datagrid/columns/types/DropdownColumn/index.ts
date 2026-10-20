import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintDropdown } from './DropdownPainter';
import { SelectEditor } from '../SelectColumn/SelectEditor';

export const DropdownColumnPlugin: IColumnTypePlugin<string> = {
  type: 'dropdown',
  paint: paintDropdown,
  editorComponent: SelectEditor,

  onPointerDown({ localX, column }) {
    if (localX > column.width - 28) {
      return { handled: true, shouldOpenEditor: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, openEditor }) {
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openEditor(event.key);
      return true;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
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
