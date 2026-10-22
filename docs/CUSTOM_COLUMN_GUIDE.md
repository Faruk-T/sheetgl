# Creating Custom Column Plugins in SheetGL

SheetGL follows the **Open-Closed Principle (SOLID)**. The core grid contains zero hardcoded column rendering logic; instead, all cell types are pluggable modules registered into the `ColumnTypeRegistry`.

This guide walks you through building two types of custom plugins:
1. **A Zero-DOM Interactive Plugin** (e.g. an Avatar / Badge with direct canvas click handling).
2. **A Micro-DOM Plugin with Floating Editor** (e.g. a Color Picker with an interactive HTML input).

---

## 1. Zero-DOM Plugin: User Avatar & Status Dot

A Zero-DOM plugin draws directly onto the Canvas 2D context and requires **no HTML elements**, providing maximum performance with 10,000+ items.

### Implementation (`AvatarColumnPlugin.ts`)

```tsx
import { IColumnTypePlugin, CellPaintContext, ColumnTypeRegistry } from 'sheetgl';

export const AvatarColumnPlugin: IColumnTypePlugin = {
  type: 'avatar',

  paint(context: CellPaintContext) {
    const { ctx, value, x, y, width, height, theme } = context;

    ctx.save();

    // 1. Calculate dimensions
    const avatarRadius = 12;
    const avatarX = x + 16;
    const avatarY = y + height / 2;

    // 2. Draw circular avatar placeholder
    ctx.fillStyle = theme.isDark ? '#3A3A3C' : '#E5E5EA';
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw initial letter inside avatar circle
    const initial = typeof value === 'string' && value.length > 0 ? value.charAt(0).toUpperCase() : '?';
    ctx.fillStyle = theme.canvas.cellText;
    ctx.font = `600 11px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, avatarX, avatarY);

    // 4. Draw user name next to avatar
    ctx.textAlign = 'left';
    ctx.font = `400 ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.fillText(String(value ?? ''), avatarX + avatarRadius + 8, avatarY);

    ctx.restore();
  },

  getExportText(value: any) {
    return String(value ?? '');
  },
};

// Register your plugin globally
ColumnTypeRegistry.register(AvatarColumnPlugin);
```

### Usage in `<SheetGL />`
```tsx
const columns: ColumnDef[] = [
  {
    id: 'user',
    title: 'Team Member',
    type: 'avatar',
    width: 200,
  },
];
```

---

## 2. Micro-DOM Plugin: Interactive Color Picker

When a cell requires complex browser inputs (such as rich text, calendar pickers, or HTML5 color inputs), provide an `editorComponent`. This component mounts dynamically upon double-click and unmounts immediately upon commit.

### Implementation (`ColorPickerPlugin.tsx`)

```tsx
import React, { useRef, useEffect } from 'react';
import {
  IColumnTypePlugin,
  CellPaintContext,
  CellEditorProps,
  ColumnTypeRegistry,
} from 'sheetgl';

// 1. The Micro-DOM Floating Editor Component
const ColorPickerEditor: React.FC<CellEditorProps> = ({
  value,
  rect,
  onCommit,
  onCancel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 50,
        padding: '2px 8px',
      }}
    >
      <input
        ref={inputRef}
        type="color"
        defaultValue={value || '#007AFF'}
        onChange={(e) => onCommit(e.target.value, 'none')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onCommit(inputRef.current?.value || value, 'down');
          if (e.key === 'Escape') onCancel();
        }}
        style={{ width: '100%', height: '80%', cursor: 'pointer', border: 'none' }}
      />
    </div>
  );
};

// 2. The Column Plugin Definition
export const ColorPickerPlugin: IColumnTypePlugin = {
  type: 'color',

  paint(context: CellPaintContext) {
    const { ctx, value, x, y, width, height, theme } = context;

    ctx.save();
    const hexColor = String(value || '#007AFF');

    // Draw swatch preview box
    ctx.fillStyle = hexColor;
    ctx.roundRect(x + 10, y + (height - 18) / 2, 24, 18, 4);
    ctx.fill();

    // Draw border around swatch
    ctx.strokeStyle = theme.canvas.gridLine;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Hex Code text
    ctx.fillStyle = theme.canvas.cellText;
    ctx.font = `500 12px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(hexColor, x + 42, y + height / 2);

    ctx.restore();
  },

  // Attach the editor
  editorComponent: ColorPickerEditor,

  getExportText(value: any) {
    return String(value ?? '');
  },
};

// Register
ColumnTypeRegistry.register(ColorPickerPlugin);
```

### Usage
```tsx
const columns: ColumnDef[] = [
  {
    id: 'brandColor',
    title: 'Brand Color',
    type: 'color',
    width: 150,
  },
];
```
