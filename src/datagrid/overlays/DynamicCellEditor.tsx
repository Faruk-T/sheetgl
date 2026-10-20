import React from 'react';
import { ColumnTypeRegistry } from '../columns/ColumnTypeRegistry';
import { ActiveOverlayState } from '../types/grid';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';

export interface DynamicCellEditorProps {
  overlay: ActiveOverlayState;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  validationError?: string | null;
  isValidating?: boolean;
  onCommit: (newValue: any, moveDir?: 'down' | 'right' | 'left' | 'none') => void;
  onCancel: () => void;
}

export const DynamicCellEditor: React.FC<DynamicCellEditorProps> = ({
  overlay,
  theme,
  locale,
  validationError,
  isValidating,
  onCommit,
  onCancel,
}) => {
  const plugin = ColumnTypeRegistry.get(overlay.column.type);
  const EditorComponent = plugin.editorComponent;
  const isTR = locale.code.startsWith('tr');

  if (!EditorComponent) {
    return null;
  }

  return (
    <>
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
      {(validationError || isValidating) && (
        <div
          style={{
            position: 'absolute',
            left: Math.max(4, overlay.x),
            top: overlay.y + overlay.height + 3,
            zIndex: 210,
            maxWidth: 320,
            padding: '5px 10px',
            borderRadius: 6,
            backgroundColor: isValidating ? '#0284C7' : '#DC2626',
            color: '#FFFFFF',
            fontSize: 11.5,
            fontWeight: 700,
            fontFamily: theme.fontFamily,
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            pointerEvents: 'none',
          }}
        >
          <span>{isValidating ? '⏳' : '⛔'}</span>
          <span>
            {isValidating
              ? isTR
                ? 'Kural doğrulanıyor (Async)...'
                : 'Validating rule (Async)...'
              : validationError}
          </span>
        </div>
      )}
    </>
  );
};
