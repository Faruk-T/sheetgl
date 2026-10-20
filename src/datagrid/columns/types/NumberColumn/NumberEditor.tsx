import React, { useEffect, useRef, useState } from 'react';
import { CellEditorProps } from '../../IColumnTypePlugin';

export const NumberEditor: React.FC<CellEditorProps<number>> = ({
  value,
  rect,
  theme,
  initialChar,
  onCommit,
  onCancel,
}) => {
  const [val, setVal] = useState<string>(initialChar ?? (value != null ? String(value) : ''));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (!initialChar) inputRef.current.select();
    }
  }, [initialChar]);

  const commitParsed = (moveDir?: 'down' | 'right' | 'left' | 'none') => {
    const clean = val.replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    onCommit(isNaN(parsed) ? 0 : parsed, moveDir);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitParsed(e.shiftKey ? 'none' : 'down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitParsed(e.shiftKey ? 'left' : 'right');
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
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commitParsed('none')}
        style={{
          width: '100%',
          height: '100%',
          padding: '0 8px',
          textAlign: 'right',
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
