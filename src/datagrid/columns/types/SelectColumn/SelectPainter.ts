import { CellPaintContext } from '../../IColumnTypePlugin';
import { SelectOption } from '../../../types/grid';

/**
 * Açık renkleri Dark Mode için Apple / Google tarzı yarı saydam ve canlı renklere dönüştürür
 */
function resolveBadgeColors(opt: SelectOption, isDark: boolean): { bg: string; fg: string; border?: string } {
  if (!isDark) {
    return {
      bg: opt.bg || '#E5E5EA',
      fg: opt.fg || '#1D1D1F',
      border: undefined,
    };
  }

  // 1. Kullanıcı özel darkBg / darkFg verdiyse öncelikle onu kullan
  if (opt.darkBg && opt.darkFg) {
    return {
      bg: opt.darkBg,
      fg: opt.darkFg,
      border: opt.darkFg ? `${opt.darkFg}33` : undefined,
    };
  }

  // 2. Akıllı renk tahmini (Hex veya Tailwind/pastel renkler)
  const bg = (opt.bg || '').toLowerCase();
  const fg = (opt.fg || '').toLowerCase();

  // Yeşil (Aktif / Onay / Başarılı)
  if (bg.includes('dcfce7') || fg.includes('166534') || bg.includes('green') || bg.includes('emerald')) {
    return { bg: 'rgba(48, 209, 88, 0.16)', fg: '#30D158', border: 'rgba(48, 209, 88, 0.28)' };
  }
  // Sarı / Turuncu (Beklemede / Uyarı)
  if (bg.includes('fef3c7') || fg.includes('92400e') || bg.includes('yellow') || bg.includes('amber')) {
    return { bg: 'rgba(255, 159, 10, 0.16)', fg: '#FF9F0A', border: 'rgba(255, 159, 10, 0.28)' };
  }
  // Mavi / Cyan (İncelemede / Bilgi)
  if (bg.includes('e0f2fe') || fg.includes('075985') || bg.includes('blue') || bg.includes('sky')) {
    return { bg: 'rgba(10, 132, 255, 0.16)', fg: '#64D2FF', border: 'rgba(10, 132, 255, 0.28)' };
  }
  // Kırmızı / Rose (İptal / Hata)
  if (bg.includes('fee2e2') || fg.includes('991b1b') || bg.includes('red') || bg.includes('rose')) {
    return { bg: 'rgba(255, 69, 58, 0.16)', fg: '#FF453A', border: 'rgba(255, 69, 58, 0.28)' };
  }
  // Mor / Violet
  if (bg.includes('purple') || bg.includes('violet') || bg.includes('f3e8ff')) {
    return { bg: 'rgba(191, 90, 242, 0.16)', fg: '#BF5AF2', border: 'rgba(191, 90, 242, 0.28)' };
  }

  // Varsayılan koyu nötr rozet
  return {
    bg: opt.darkBg || 'rgba(255, 255, 255, 0.08)',
    fg: opt.darkFg || '#F5F5F7',
    border: 'rgba(255, 255, 255, 0.12)',
  };
}

export function paintSelect({ ctx, value, column, theme, x, y, width, height }: CellPaintContext<string>): void {
  if (!value) return;

  const opt = column.options?.find((o) => o.value === value) ?? {
    value,
    label: String(value),
  };

  const colors = resolveBadgeColors(opt, theme.isDark);

  ctx.save();
  const pad = 6;
  const pillH = 22;
  const pillY = y + (height - pillH) / 2;
  const pillW = Math.min(width - pad * 2 - 18, 180);

  if (pillW > 20) {
    // Rozet Zemin
    ctx.fillStyle = colors.bg;
    ctx.beginPath();
    ctx.roundRect(x + pad, pillY, pillW, pillH, 4);
    ctx.fill();

    // Rozet Kenarlık (Koyu modda derinlik için)
    if (colors.border) {
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Rozet Metin
    ctx.beginPath();
    ctx.rect(x + pad + 6, pillY, pillW - 12, pillH);
    ctx.clip();

    ctx.fillStyle = colors.fg;
    ctx.font = `600 ${theme.fontSize - 1}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(opt.label, x + pad + 8, y + height / 2);
  }

  // Açılır ok ikonu (▼)
  ctx.restore();
  ctx.save();
  ctx.fillStyle = theme.isDark ? '#8E8E93' : '#AEAEB2';
  ctx.beginPath();
  const arrowX = x + width - 12;
  const arrowY = y + height / 2;
  ctx.moveTo(arrowX - 3.5, arrowY - 2);
  ctx.lineTo(arrowX + 3.5, arrowY - 2);
  ctx.lineTo(arrowX, arrowY + 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
