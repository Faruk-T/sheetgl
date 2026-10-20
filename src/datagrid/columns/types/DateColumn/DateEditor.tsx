import React, { useEffect, useRef, useState } from 'react';
import { CellEditorProps } from '../../IColumnTypePlugin';

export const DateEditor: React.FC<CellEditorProps<string>> = ({
  value,
  rect,
  theme,
  onCommit,
  onCancel,
}) => {
  // Format to YYYY-MM-DD for native input[type="date"]
  const formatForInput = (raw: any): string => {
    if (!raw) return '';
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch {
      // fallback
    }
    return String(raw);
  };

  const [dateVal, setDateVal] = useState<string>(formatForInput(value));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit(dateVal, e.shiftKey ? 'none' : 'down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onCommit(dateVal, e.shiftKey ? 'left' : 'right');
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
        width: Math.max(rect.width, 140),
        height: rect.height,
        zIndex: 50,
      }}
    >
      <input
        ref={inputRef}
        type="date"
        value={dateVal}
        onChange={(e) => setDateVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onCommit(dateVal, 'none')}
        style={{
          width: '100%',
          height: '100%',
          padding: '0 6px',
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
