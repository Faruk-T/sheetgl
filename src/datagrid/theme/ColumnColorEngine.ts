import {
  ColumnColorConfig,
  ColumnColorPreset,
  ColumnDef,
  ColumnGroupDef,
  ThemeAwareColor,
} from '../types/grid';

export interface ResolvedPaletteTokens {
  groupHeaderBg: string;
  groupHeaderText: string;
  groupHeaderBorder: string;
  headerBg: string;
  headerText: string;
  headerAccent: string;
  columnBg: string;
  columnText?: string;
}

export interface DualThemePalette {
  light: ResolvedPaletteTokens;
  dark: ResolvedPaletteTokens;
}

export interface ResolvedGroupHeaderStyle {
  headerBg?: string;
  headerText?: string;
  headerAccent?: string;
  borderColor?: string;
  groupHeaderBg?: string;
  groupHeaderText?: string;
  groupHeaderBorder?: string;
  accentColor?: string;
}

export type ResolvedColumnGroupStyle = ResolvedGroupHeaderStyle;

export interface ResolvedColumnStyle {
  headerBg?: string;
  headerText?: string;
  headerAccent?: string;
  columnBg?: string;
  columnText?: string;
  borderColor?: string;
}

export const COLUMN_COLOR_PRESET_LIST: Array<{
  id: ColumnColorPreset;
  labelTR: string;
  labelEN: string;
  swatch: string;
}> = [
  { id: 'blue', labelTR: 'Mavi (Blue)', labelEN: 'Blue', swatch: '#3B82F6' },
  { id: 'indigo', labelTR: 'Çivit (Indigo)', labelEN: 'Indigo', swatch: '#6366F1' },
  { id: 'violet', labelTR: 'Menekşe (Violet)', labelEN: 'Violet', swatch: '#8B5CF6' },
  { id: 'purple', labelTR: 'Mor (Purple)', labelEN: 'Purple', swatch: '#A855F7' },
  { id: 'emerald', labelTR: 'Zümrüt (Emerald)', labelEN: 'Emerald', swatch: '#10B981' },
  { id: 'green', labelTR: 'Yeşil (Green)', labelEN: 'Green', swatch: '#22C55E' },
  { id: 'teal', labelTR: 'Turkuaz (Teal)', labelEN: 'Teal', swatch: '#14B8A6' },
  { id: 'cyan', labelTR: 'Camgöbeği (Cyan)', labelEN: 'Cyan', swatch: '#06B6D4' },
  { id: 'amber', labelTR: 'Kehribar (Amber)', labelEN: 'Amber', swatch: '#F59E0B' },
  { id: 'orange', labelTR: 'Turuncu (Orange)', labelEN: 'Orange', swatch: '#F97316' },
  { id: 'rose', labelTR: 'Gül (Rose)', labelEN: 'Rose', swatch: '#F43F5E' },
  { id: 'red', labelTR: 'Kırmızı (Red)', labelEN: 'Red', swatch: '#EF4444' },
  { id: 'slate', labelTR: 'Arduvaz (Slate)', labelEN: 'Slate', swatch: '#64748B' },
];

export const COLUMN_COLOR_PALETTES: Record<ColumnColorPreset, DualThemePalette> = {
  blue: {
    light: {
      groupHeaderBg: '#DBEAFE',
      groupHeaderText: '#1E40AF',
      groupHeaderBorder: '#93C5FD',
      headerBg: '#EFF6FF',
      headerText: '#1D4ED8',
      headerAccent: '#2563EB',
      columnBg: 'rgba(37, 99, 235, 0.045)',
    },
    dark: {
      groupHeaderBg: 'rgba(30, 64, 175, 0.42)',
      groupHeaderText: '#93C5FD',
      groupHeaderBorder: 'rgba(59, 130, 246, 0.45)',
      headerBg: 'rgba(30, 58, 138, 0.28)',
      headerText: '#BFDBFE',
      headerAccent: '#3B82F6',
      columnBg: 'rgba(59, 130, 246, 0.065)',
    },
  },
  indigo: {
    light: {
      groupHeaderBg: '#E0E7FF',
      groupHeaderText: '#3730A3',
      groupHeaderBorder: '#A5B4FC',
      headerBg: '#EEF2FF',
      headerText: '#4338CA',
      headerAccent: '#4F46E5',
      columnBg: 'rgba(79, 70, 229, 0.045)',
    },
    dark: {
      groupHeaderBg: 'rgba(55, 48, 163, 0.42)',
      groupHeaderText: '#A5B4FC',
      groupHeaderBorder: 'rgba(99, 102, 241, 0.45)',
      headerBg: 'rgba(49, 46, 129, 0.28)',
      headerText: '#C7D2FE',
      headerAccent: '#6366F1',
      columnBg: 'rgba(99, 102, 241, 0.065)',
    },
  },
  violet: {
    light: {
      groupHeaderBg: '#EDE9FE',
      groupHeaderText: '#5B21B6',
      groupHeaderBorder: '#C4B5FD',
      headerBg: '#F5F3FF',
      headerText: '#6D28D9',
      headerAccent: '#7C3AED',
      columnBg: 'rgba(124, 58, 237, 0.045)',
    },
    dark: {
      groupHeaderBg: 'rgba(91, 33, 182, 0.42)',
      groupHeaderText: '#C4B5FD',
      groupHeaderBorder: 'rgba(139, 92, 246, 0.45)',
      headerBg: 'rgba(76, 29, 149, 0.28)',
      headerText: '#DDD6FE',
      headerAccent: '#8B5CF6',
      columnBg: 'rgba(139, 92, 246, 0.065)',
    },
  },
  purple: {
    light: {
      groupHeaderBg: '#F3E8FF',
      groupHeaderText: '#6B21A8',
      groupHeaderBorder: '#D8B4FE',
      headerBg: '#FAF5FF',
      headerText: '#7E22CE',
      headerAccent: '#9333EA',
      columnBg: 'rgba(147, 51, 234, 0.045)',
    },
    dark: {
      groupHeaderBg: 'rgba(107, 33, 168, 0.42)',
      groupHeaderText: '#D8B4FE',
      groupHeaderBorder: 'rgba(168, 85, 247, 0.45)',
      headerBg: 'rgba(88, 28, 135, 0.28)',
      headerText: '#E9D5FF',
      headerAccent: '#A855F7',
      columnBg: 'rgba(168, 85, 247, 0.065)',
    },
  },
  emerald: {
    light: {
      groupHeaderBg: '#D1FAE5',
      groupHeaderText: '#065F46',
      groupHeaderBorder: '#6EE7B7',
      headerBg: '#ECFDF5',
      headerText: '#047857',
      headerAccent: '#10B981',
      columnBg: 'rgba(16, 185, 129, 0.05)',
    },
    dark: {
      groupHeaderBg: 'rgba(6, 95, 70, 0.45)',
      groupHeaderText: '#6EE7B7',
      groupHeaderBorder: 'rgba(16, 185, 129, 0.45)',
      headerBg: 'rgba(6, 78, 59, 0.30)',
      headerText: '#A7F3D0',
      headerAccent: '#10B981',
      columnBg: 'rgba(16, 185, 129, 0.065)',
    },
  },
  green: {
    light: {
      groupHeaderBg: '#DCFCE7',
      groupHeaderText: '#166534',
      groupHeaderBorder: '#86EFAC',
      headerBg: '#F0FDF4',
      headerText: '#15803D',
      headerAccent: '#22C55E',
      columnBg: 'rgba(34, 197, 94, 0.05)',
    },
    dark: {
      groupHeaderBg: 'rgba(22, 101, 52, 0.45)',
      groupHeaderText: '#86EFAC',
      groupHeaderBorder: 'rgba(34, 197, 94, 0.45)',
      headerBg: 'rgba(20, 83, 45, 0.30)',
      headerText: '#BBF7D0',
      headerAccent: '#22C55E',
      columnBg: 'rgba(34, 197, 94, 0.065)',
    },
  },
  teal: {
    light: {
      groupHeaderBg: '#CCFBF1',
      groupHeaderText: '#115E59',
      groupHeaderBorder: '#5EEAD4',
      headerBg: '#F0FDFA',
      headerText: '#0F766E',
      headerAccent: '#14B8A6',
      columnBg: 'rgba(20, 184, 166, 0.05)',
    },
    dark: {
      groupHeaderBg: 'rgba(17, 94, 89, 0.45)',
      groupHeaderText: '#5EEAD4',
      groupHeaderBorder: 'rgba(20, 184, 166, 0.45)',
      headerBg: 'rgba(19, 78, 74, 0.30)',
      headerText: '#99F6E4',
      headerAccent: '#14B8A6',
      columnBg: 'rgba(20, 184, 166, 0.065)',
    },
  },
  cyan: {
    light: {
      groupHeaderBg: '#CFFAFE',
      groupHeaderText: '#155E75',
      groupHeaderBorder: '#67E8F9',
      headerBg: '#ECFEFF',
      headerText: '#0E7490',
      headerAccent: '#06B6D4',
      columnBg: 'rgba(6, 182, 212, 0.05)',
    },
    dark: {
      groupHeaderBg: 'rgba(21, 94, 117, 0.45)',
      groupHeaderText: '#67E8F9',
      groupHeaderBorder: 'rgba(6, 182, 212, 0.45)',
      headerBg: 'rgba(22, 78, 99, 0.30)',
      headerText: '#A5F3FC',
      headerAccent: '#06B6D4',
      columnBg: 'rgba(6, 182, 212, 0.065)',
    },
  },
  amber: {
    light: {
      groupHeaderBg: '#FEF3C7',
      groupHeaderText: '#92400E',
      groupHeaderBorder: '#FCD34D',
      headerBg: '#FFFBEB',
      headerText: '#B45309',
      headerAccent: '#F59E0B',
      columnBg: 'rgba(245, 158, 11, 0.055)',
    },
    dark: {
      groupHeaderBg: 'rgba(146, 64, 14, 0.42)',
      groupHeaderText: '#FCD34D',
      groupHeaderBorder: 'rgba(245, 158, 11, 0.45)',
      headerBg: 'rgba(120, 53, 15, 0.28)',
      headerText: '#FDE68A',
      headerAccent: '#F59E0B',
      columnBg: 'rgba(245, 158, 11, 0.065)',
    },
  },
  orange: {
    light: {
      groupHeaderBg: '#FFEDD5',
      groupHeaderText: '#9A3412',
      groupHeaderBorder: '#FDBA74',
      headerBg: '#FFF7ED',
      headerText: '#C2410C',
      headerAccent: '#F97316',
      columnBg: 'rgba(249, 115, 22, 0.05)',
    },
    dark: {
      groupHeaderBg: 'rgba(154, 52, 18, 0.42)',
      groupHeaderText: '#FDBA74',
      groupHeaderBorder: 'rgba(249, 115, 22, 0.45)',
      headerBg: 'rgba(124, 45, 18, 0.28)',
      headerText: '#FED7AA',
      headerAccent: '#F97316',
      columnBg: 'rgba(249, 115, 22, 0.065)',
    },
  },
  rose: {
    light: {
      groupHeaderBg: '#FFE4E6',
      groupHeaderText: '#9F1239',
      groupHeaderBorder: '#FDA4AF',
      headerBg: '#FFF1F2',
      headerText: '#BE123C',
      headerAccent: '#F43F5E',
      columnBg: 'rgba(244, 63, 94, 0.045)',
    },
    dark: {
      groupHeaderBg: 'rgba(159, 18, 57, 0.42)',
      groupHeaderText: '#FDA4AF',
      groupHeaderBorder: 'rgba(244, 63, 94, 0.45)',
      headerBg: 'rgba(136, 19, 55, 0.28)',
      headerText: '#FECDD3',
      headerAccent: '#F43F5E',
      columnBg: 'rgba(244, 63, 94, 0.065)',
    },
  },
  red: {
    light: {
      groupHeaderBg: '#FEE2E2',
      groupHeaderText: '#991B1B',
      groupHeaderBorder: '#FCA5A5',
      headerBg: '#FEF2F2',
      headerText: '#B91C1C',
      headerAccent: '#EF4444',
      columnBg: 'rgba(239, 68, 68, 0.045)',
    },
    dark: {
      groupHeaderBg: 'rgba(153, 27, 27, 0.42)',
      groupHeaderText: '#FCA5A5',
      groupHeaderBorder: 'rgba(239, 68, 68, 0.45)',
      headerBg: 'rgba(127, 29, 29, 0.28)',
      headerText: '#FECACA',
      headerAccent: '#EF4444',
      columnBg: 'rgba(239, 68, 68, 0.065)',
    },
  },
  slate: {
    light: {
      groupHeaderBg: '#E2E8F0',
      groupHeaderText: '#1E293B',
      groupHeaderBorder: '#94A3B8',
      headerBg: '#F1F5F9',
      headerText: '#334155',
      headerAccent: '#64748B',
      columnBg: 'rgba(100, 116, 139, 0.045)',
    },
    dark: {
      groupHeaderBg: 'rgba(51, 65, 85, 0.55)',
      groupHeaderText: '#CBD5E1',
      groupHeaderBorder: 'rgba(148, 163, 184, 0.35)',
      headerBg: 'rgba(30, 41, 59, 0.42)',
      headerText: '#E2E8F0',
      headerAccent: '#94A3B8',
      columnBg: 'rgba(148, 163, 184, 0.05)',
    },
  },
};

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export class ColumnColorEngine {
  public static isPreset(val: any): val is ColumnColorPreset {
    return typeof val === 'string' && val in COLUMN_COLOR_PALETTES;
  }

  public static getPresetTokens(preset: ColumnColorPreset, isDark: boolean): ResolvedPaletteTokens {
    const entry = COLUMN_COLOR_PALETTES[preset] || COLUMN_COLOR_PALETTES.blue;
    return isDark ? entry.dark : entry.light;
  }

  /**
   * Resolves a ThemeAwareColor for a specific role ('groupHeaderBg' | 'groupHeaderText' | 'headerBg' | 'headerText' | 'headerAccent' | 'columnBg' | 'columnText' | 'raw')
   */
  public static resolveColorValue(
    input: ThemeAwareColor | undefined,
    isDark: boolean,
    role:
      | 'groupHeaderBg'
      | 'groupHeaderText'
      | 'groupHeaderBorder'
      | 'headerBg'
      | 'headerText'
      | 'headerAccent'
      | 'columnBg'
      | 'columnText'
      | 'raw' = 'raw'
  ): string | undefined {
    if (!input) return undefined;

    // 1. Explicit { light, dark } pair
    if (typeof input === 'object' && ('light' in input || 'dark' in input)) {
      const picked = isDark ? input.dark || input.light : input.light || input.dark;
      if (!picked) return undefined;
      if (this.isPreset(picked)) {
        const tokens = this.getPresetTokens(picked, isDark);
        return role === 'raw' ? tokens.headerAccent : tokens[role] || tokens.headerAccent;
      }
      return picked;
    }

    if (typeof input !== 'string') return undefined;
    const str = input.trim();
    if (!str) return undefined;

    // 2. Named semantic preset ('emerald', 'blue', 'amber', etc.)
    if (this.isPreset(str)) {
      const tokens = this.getPresetTokens(str, isDark);
      return role === 'raw' ? tokens.headerAccent : tokens[role] || tokens.headerAccent;
    }

    // 3. Single hex color string -> auto-adapt for Dark / Light surface roles if used as background shorthand
    const rgb = parseHexRgb(str);
    if (rgb) {
      if (role === 'groupHeaderBg') {
        return isDark
          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.34)`
          : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
      }
      if (role === 'headerBg') {
        return isDark
          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.24)`
          : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`;
      }
      if (role === 'columnBg') {
        return isDark
          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`
          : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`;
      }
      if (role === 'groupHeaderBorder') {
        return isDark
          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.48)`
          : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`;
      }
    }

    return str;
  }

  public static resolveGroupStyle(
    group: ColumnGroupDef | undefined,
    isDark: boolean
  ): ResolvedGroupHeaderStyle {
    if (!group) return {};
    const baseColor = group.style?.preset || group.color;
    const style: ColumnColorConfig | undefined = group.style;

    const groupHeaderBg =
      this.resolveColorValue(style?.groupHeaderBg, isDark, 'groupHeaderBg') ||
      this.resolveColorValue(style?.headerBg, isDark, 'groupHeaderBg') ||
      this.resolveColorValue(group.headerColor, isDark, 'groupHeaderBg') ||
      this.resolveColorValue(baseColor, isDark, 'groupHeaderBg');

    const groupHeaderText =
      this.resolveColorValue(style?.groupHeaderText, isDark, 'groupHeaderText') ||
      this.resolveColorValue(style?.headerText, isDark, 'groupHeaderText') ||
      this.resolveColorValue(group.headerTextColor, isDark, 'groupHeaderText') ||
      (baseColor && this.isPreset(baseColor)
        ? this.getPresetTokens(baseColor, isDark).groupHeaderText
        : undefined);

    const groupHeaderBorder =
      this.resolveColorValue(style?.borderColor, isDark, 'groupHeaderBorder') ||
      this.resolveColorValue(baseColor, isDark, 'groupHeaderBorder');

    const accentColor =
      this.resolveColorValue(style?.headerAccent, isDark, 'headerAccent') ||
      this.resolveColorValue(baseColor, isDark, 'headerAccent') ||
      this.resolveColorValue(group.headerColor, isDark, 'headerAccent');

    return {
      headerBg: groupHeaderBg,
      headerText: groupHeaderText,
      headerAccent: accentColor,
      borderColor: groupHeaderBorder,
      groupHeaderBg,
      groupHeaderText,
      groupHeaderBorder,
      accentColor,
    };
  }

  public static resolveColumnStyle(
    col: ColumnDef,
    group: ColumnGroupDef | undefined,
    isDark: boolean
  ): ResolvedColumnStyle {
    const inheritGroup = group && group.inheritColumnColors !== false;
    const groupBaseColor = inheritGroup ? group.style?.preset || group.color : undefined;
    const colBaseColor = col.style?.preset || col.color;
    const effectiveBase = colBaseColor || groupBaseColor;

    // 1. Header Background
    const headerBg =
      this.resolveColorValue(col.style?.headerBg, isDark, 'headerBg') ||
      this.resolveColorValue(col.headerColor, isDark, 'headerBg') ||
      this.resolveColorValue(colBaseColor, isDark, 'headerBg') ||
      (inheritGroup
        ? this.resolveColorValue(group.style?.headerBg, isDark, 'headerBg') ||
          this.resolveColorValue(group.headerColor, isDark, 'headerBg') ||
          this.resolveColorValue(groupBaseColor, isDark, 'headerBg')
        : undefined);

    // 2. Header Text
    const headerText =
      this.resolveColorValue(col.style?.headerText, isDark, 'headerText') ||
      this.resolveColorValue(col.headerTextColor, isDark, 'headerText') ||
      (colBaseColor && this.isPreset(colBaseColor)
        ? this.getPresetTokens(colBaseColor, isDark).headerText
        : undefined) ||
      (inheritGroup
        ? this.resolveColorValue(group.style?.headerText, isDark, 'headerText') ||
          (groupBaseColor && this.isPreset(groupBaseColor)
            ? this.getPresetTokens(groupBaseColor, isDark).headerText
            : undefined)
        : undefined);

    // 3. Header Accent Line
    const headerAccent =
      this.resolveColorValue(col.style?.headerAccent, isDark, 'headerAccent') ||
      this.resolveColorValue(colBaseColor, isDark, 'headerAccent') ||
      this.resolveColorValue(col.headerColor, isDark, 'headerAccent') ||
      (inheritGroup
        ? this.resolveColorValue(group.style?.headerAccent, isDark, 'headerAccent') ||
          this.resolveColorValue(groupBaseColor, isDark, 'headerAccent')
        : undefined);

    // 4. Column Cell Background Tint
    const columnBg =
      this.resolveColorValue(col.style?.columnBg, isDark, 'columnBg') ||
      this.resolveColorValue(col.columnColor, isDark, 'columnBg') ||
      this.resolveColorValue(colBaseColor, isDark, 'columnBg') ||
      (inheritGroup
        ? this.resolveColorValue(group.style?.columnBg, isDark, 'columnBg') ||
          this.resolveColorValue(group.columnColor, isDark, 'columnBg') ||
          this.resolveColorValue(groupBaseColor, isDark, 'columnBg')
        : undefined);

    // 5. Column Cell Text Color
    const columnText =
      this.resolveColorValue(col.style?.columnText, isDark, 'columnText') ||
      this.resolveColorValue(col.columnTextColor, isDark, 'columnText') ||
      (inheritGroup
        ? this.resolveColorValue(group.style?.columnText, isDark, 'columnText')
        : undefined) ||
      (effectiveBase && this.isPreset(effectiveBase)
        ? this.getPresetTokens(effectiveBase, isDark).columnText
        : undefined);

    // 6. Optional Column Header Border Color
    const borderColor =
      this.resolveColorValue(col.style?.borderColor, isDark, 'groupHeaderBorder') ||
      (inheritGroup
        ? this.resolveColorValue(group.style?.borderColor, isDark, 'groupHeaderBorder')
        : undefined);

    return {
      headerBg,
      headerText,
      headerAccent,
      columnBg,
      columnText,
      borderColor,
    };
  }
}
