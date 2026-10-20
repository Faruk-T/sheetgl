import React from 'react';
import { ColumnTypeRegistry } from '../columns/ColumnTypeRegistry';
import { ActiveOverlayState } from '../types/grid';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';

export interface DynamicCellEditorProps {
  overlay: ActiveOverlayState;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  onCommit: (newValue: any, moveDir?: 'down' | 'right' | 'left' | 'none') => void;
  onCancel: () => void;
}

export const DynamicCellEditor: React.FC<DynamicCellEditorProps> = ({
  overlay,
  theme,
  locale,
  onCommit,
  onCancel,
}) => {
  const plugin = ColumnTypeRegistry.get(overlay.column.type);
  const EditorComponent = plugin.editorComponent;

  if (!EditorComponent) {
    return null;
  }

  return (
    <EditorComponent
      value={overlay.initialValue}
      column={overlay.column}
      theme={theme}
      rect={{
        x: overlay.x,
        y: overlay.y,
        width: overlay.width,
        height: overlay.height,
      }}
      locale={locale}
      initialChar={overlay.initialChar}
      onCommit={onCommit}
      onCancel={onCancel}
    />
  );
};
