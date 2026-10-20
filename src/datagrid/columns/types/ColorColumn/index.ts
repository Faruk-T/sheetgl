import { CellPaintContext, IColumnTypePlugin } from '../../IColumnTypePlugin';
import { ColorEditor } from './ColorEditor';

export function paintColor({
  ctx,
  value,
  theme,
  x,
  y,
  width,
  height,
}: CellPaintContext<string>): void {
  const color = value != null && String(value).trim() ? String(value).trim() : '#38BDF8';
  const centerY = y + height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 6, y, width - 12, height);
  ctx.clip();

  // Swatch box
  const swatchSize = 16;
  const swatchX = x + 8;
  const swatchY = centerY - swatchSize / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(swatchX, swatchY, swatchSize, swatchSize, 4);
  ctx.fill();

  ctx.strokeStyle = theme.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hex text
  ctx.fillStyle = theme.canvas.cellText;
  ctx.font = `600 ${theme.fontSize - 2}px monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(color.toUpperCase(), swatchX + swatchSize + 8, centerY);

  ctx.restore();
}

export const ColorColumnPlugin: IColumnTypePlugin<string> = {
  type: 'color',
  paint: paintColor,
  editorComponent: ColorEditor,

  onPointerDown() {
    return { handled: true, shouldOpenEditor: true };
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
    return text.trim();
  },

  formatClipboard(value) {
    return String(value ?? '#38BDF8');
  },

  comparator(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''), 'tr-TR');
  },
};
