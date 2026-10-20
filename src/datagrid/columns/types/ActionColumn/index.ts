import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintAction } from './ActionPainter';

export const ActionColumnPlugin: IColumnTypePlugin<any> = {
  type: 'action',
  paint: paintAction,

  onPointerDown({ column, value }) {
    if (column.onActionClick) {
      column.onActionClick(value, 0);
      return { handled: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, column, value }) {
    if (event.key === 'Enter') {
      if (column.onActionClick) {
        column.onActionClick(value, 0);
        return true;
      }
    }
    return false;
  },
};
