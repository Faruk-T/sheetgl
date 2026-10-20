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

    // 1. Zemin
    ctx.fillStyle = theme.canvas.groupRowBg;
    ctx.fillRect(0, y, width, height);

    // 2. Alt Çizgi
    ctx.strokeStyle = theme.canvas.groupRowBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + height - 0.5);
    ctx.lineTo(width, y + height - 0.5);
    ctx.stroke();

    // 3. Girinti & Açılır Ok (▶ / ▼)
    const indent = 16 + groupRow.level * 20;
    const midY = y + height / 2;

    ctx.fillStyle = theme.canvas.groupRowText;
    ctx.beginPath();
    if (groupRow.isExpanded) {
      // Aşağı ok (▼)
      ctx.moveTo(indent - 4, midY - 2);
      ctx.lineTo(indent + 4, midY - 2);
      ctx.lineTo(indent, midY + 3);
    } else {
      // Sağa ok (▶)
      ctx.moveTo(indent - 2, midY - 4);
      ctx.lineTo(indent - 2, midY + 4);
      ctx.lineTo(indent + 3, midY);
    }
    ctx.closePath();
    ctx.fill();

    // 4. Grup Başlığı Metni
    ctx.fillStyle = theme.canvas.groupRowText;
    ctx.font = `600 ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const title = `${groupRow.field}: ${groupRow.value} (${locale.groupRecordCount(groupRow.rowCount)})`;
    ctx.fillText(title, indent + 12, midY);

    // 5. Grup İçi Özetler (Varsa sağa doğru)
    if (groupRow.summaries && Object.keys(groupRow.summaries).length > 0) {
      const summaryText = Object.entries(groupRow.summaries)
        .map(([k, v]) => `${k}: ${Number(v).toLocaleString(locale.code)}`)
        .join(' | ');

      ctx.fillStyle = theme.isDark ? '#8E8E93' : '#6E6E73';
      ctx.font = `500 ${theme.fontSize - 1}px ${theme.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(summaryText, width - 20, midY);
    }

    ctx.restore();
  }
}
