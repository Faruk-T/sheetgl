import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintSparkline } from './SparklinePainter';

export const SparklineColumnPlugin: IColumnTypePlugin<number[]> = {
  type: 'sparkline',
  paint: paintSparkline,
  editorComponent: undefined, // Salt okunur grafik

  parseClipboard(text) {
    return text.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
  },

  formatClipboard(value) {
    return Array.isArray(value) ? value.join(',') : '';
  },
};
