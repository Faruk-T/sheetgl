import { VirtualRow } from '../types/group';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';

export class GroupRowPainter {
  public static paintGroupRow(
    ctx: CanvasRenderingContext2D,
    groupRow: Extract<VirtualRow, { type: 'group' }>,
    y: number,
    width: number,
    height: number,
    theme: IGridThemeTokens,
    locale: IGridLocale
  ): void {
    ctx.save();

    // 1. Background
    ctx.fillStyle = theme.canvas.groupRowBg;
    ctx.fillRect(0, y, width, height);

    // 2. Bottom Border
    ctx.strokeStyle = theme.canvas.groupRowBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + height - 0.5);
    ctx.lineTo(width, y + height - 0.5);
    ctx.stroke();

    // 3. Left Accent Bar by Level
    ctx.fillStyle = theme.dom.accentColor;
    ctx.fillRect(groupRow.level * 6, y, 3, height);

    // 4. Indent & Chevron (▶ / ▼)
    const indent = 18 + groupRow.level * 20;
    const midY = y + height / 2;

    ctx.fillStyle = theme.canvas.groupRowText;
    ctx.beginPath();
    if (groupRow.isExpanded) {
      ctx.moveTo(indent - 4, midY - 2);
      ctx.lineTo(indent + 4, midY - 2);
      ctx.lineTo(indent, midY + 3);
    } else {
      ctx.moveTo(indent - 2, midY - 4);
      ctx.lineTo(indent - 2, midY + 4);
      ctx.lineTo(indent + 3, midY);
    }
    ctx.closePath();
    ctx.fill();

    // 5. Group Title
    ctx.fillStyle = theme.canvas.groupRowText;
    ctx.font = `600 ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const title = `${groupRow.field.toUpperCase()}: ${groupRow.value} (${locale.groupRecordCount(groupRow.rowCount)})`;
    ctx.fillText(title, indent + 12, midY);

    // 6. Group Summaries on the right
    if (groupRow.summaries && Object.keys(groupRow.summaries).length > 0) {
      const summaryText = Object.entries(groupRow.summaries)
        .slice(0, 4)
        .map(([k, v]) => {
          const sType = groupRow.summaryTypes?.[k] || 'sum';
          return `${k} (${sType.toUpperCase()}): ${Number(v).toLocaleString(locale.code, {
            maximumFractionDigits: 2,
          })}`;
        })
        .join('   •   ');

      ctx.fillStyle = theme.isDark ? '#98989D' : '#6E6E73';
      ctx.font = `600 ${theme.fontSize - 1}px ${theme.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(summaryText, width - 24, midY);
    }

    ctx.restore();
  }
}
