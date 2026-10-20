import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintRating } from './RatingPainter';

export const RatingColumnPlugin: IColumnTypePlugin<number> = {
  type: 'rating',
  paint: paintRating,
  editorComponent: undefined, // Zero-DOM: Tıklamayla doğrudan puanlama

  onPointerDown({ localX, setValue }) {
    // Tıklanan yıldızın indeksini hesapla (1..5)
    const starIndex = Math.ceil((localX - 8) / 16);
    if (starIndex >= 1 && starIndex <= 5) {
      setValue(starIndex);
      return { handled: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, setValue }) {
    // 1-5 tuşlarına basıldığında doğrudan o puanı ata
    if (/^[1-5]$/.test(event.key)) {
      event.preventDefault();
      setValue(Number(event.key));
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const num = parseInt(text.trim(), 10);
    return isNaN(num) ? 0 : Math.max(0, Math.min(5, num));
  },

  formatClipboard(value) {
    return `${value ?? 0} / 5 Yıldız`;
  },

  comparator(a, b) {
    return (Number(a) || 0) - (Number(b) || 0);
  },
};
