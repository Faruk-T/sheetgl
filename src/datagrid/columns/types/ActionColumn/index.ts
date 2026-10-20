import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintAction } from './ActionPainter';

export const ActionColumnPlugin: IColumnTypePlugin<any> = {
  type: 'action',
  paint: paintAction,

  onPointerDown({ column, row, rowIndex, value }) {
    if (column.onActionClick) {
      column.onActionClick(row ?? value, rowIndex ?? 0);
      return { handled: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, column, row, rowIndex, value }) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (column.onActionClick) {
        column.onActionClick(row ?? value, rowIndex ?? 0);
        return true;
      }
    }
    return false;
  },
};
