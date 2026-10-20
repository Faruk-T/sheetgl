import React, { useEffect, useRef, useState } from 'react';
import { CellEditorProps } from '../../IColumnTypePlugin';

export const TextEditor: React.FC<CellEditorProps<string>> = ({
  value,
  rect,
  theme,
  initialChar,
  onCommit,
  onCancel,
}) => {
  const [text, setText] = useState<string>(initialChar ?? (value != null ? String(value) : ''));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committedRef = useRef<boolean>(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (!initialChar) {
        inputRef.current.select();
      } else {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [initialChar]);

  const safeCommit = (val: string, dir?: 'down' | 'right' | 'left' | 'none') => {
    if (committedRef.current) return;
    committedRef.current = true;
    onCommit(val, dir);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      safeCommit(text, e.shiftKey ? 'none' : 'down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      safeCommit(text, e.shiftKey ? 'left' : 'right');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      committedRef.current = true;
      onCancel();
    }
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: Math.max(rect.width, 110),
        height: rect.height,
        zIndex: 100,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => safeCommit(text, 'none')}
        style={{
          width: '100%',
          height: '100%',
          padding: '0 8px',
          boxSizing: 'border-box',
          backgroundColor: theme.dom.inputBg,
          color: theme.dom.inputText,
          border: `2px solid ${theme.dom.inputFocusBorder}`,
          outline: 'none',
          fontFamily: theme.fontFamily,
          fontSize: `${theme.fontSize}px`,
          borderRadius: 3,
          boxShadow: theme.dom.popoverShadow,
        }}
      />
    </div>
  );
};
