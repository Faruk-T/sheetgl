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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (!initialChar) {
        inputRef.current.select();
      }
    }
  }, [initialChar]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit(text, e.shiftKey ? 'none' : 'down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onCommit(text, e.shiftKey ? 'left' : 'right');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: Math.max(rect.width, 100),
        height: rect.height,
        zIndex: 50,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onCommit(text, 'none')}
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
          borderRadius: 2,
        }}
      />
    </div>
  );
};
