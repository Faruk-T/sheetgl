import React, { useEffect, useRef, useState } from 'react';
import { CellEditorProps } from '../../IColumnTypePlugin';

interface ParsedDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  formatted: string;
}

function parseDateTimeParts(raw: any): ParsedDateTime {
  const now = new Date();
  if (!raw) {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const hh = now.getHours();
    const mm = now.getMinutes();
    return {
      year: y,
      month: m,
      day: d,
      hour: hh,
      minute: mm,
      formatted: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
    };
  }
  const str = String(raw).trim();
  const isoMatch = str.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2}))?/
  );
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    const hh = isoMatch[4] !== undefined ? parseInt(isoMatch[4], 10) : 9;
    const mm = isoMatch[5] !== undefined ? parseInt(isoMatch[5], 10) : 0;
    return {
      year: y,
      month: m,
      day: d,
      hour: hh,
      minute: mm,
      formatted: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
    };
  }
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: 9,
    minute: 0,
    formatted: str,
  };
}

export const DateTimeEditor: React.FC<CellEditorProps<string>> = ({
  value,
  rect,
  theme,
  locale,
  onCommit,
  onCancel,
}) => {
  const initial = parseDateTimeParts(value);
  const [textVal, setTextVal] = useState<string>(value ? initial.formatted : initial.formatted);
  const [viewYear, setViewYear] = useState<number>(initial.year);
  const [viewMonth, setViewMonth] = useState<number>(initial.month);
  const [selDay, setSelDay] = useState<number>(initial.day);
  const [selHour, setSelHour] = useState<number>(initial.hour);
  const [selMinute, setSelMinute] = useState<number>(initial.minute);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const latestValRef = useRef<string>(textVal);
  latestValRef.current = textVal;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCommit(latestValRef.current, 'none');
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  }, [onCommit]);

  const buildFormatted = (y: number, m: number, d: number, hh: number, mm: number) =>
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  const updateParts = (y: number, m: number, d: number, hh: number, mm: number) => {
    setViewYear(y);
    setViewMonth(m);
    setSelDay(d);
    setSelHour(hh);
    setSelMinute(mm);
    setTextVal(buildFormatted(y, m, d, hh, mm));
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      updateParts(viewYear - 1, 12, selDay, selHour, selMinute);
    } else {
      updateParts(viewYear, viewMonth - 1, selDay, selHour, selMinute);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      updateParts(viewYear + 1, 1, selDay, selHour, selMinute);
    } else {
      updateParts(viewYear, viewMonth + 1, selDay, selHour, selMinute);
    }
  };

  const handleSelectNow = () => {
    const now = new Date();
    const nextStr = buildFormatted(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours(),
      now.getMinutes()
    );
    onCommit(nextStr, 'none');
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth - 1, 1).getDay() + 6) % 7;
  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isTR = locale?.code?.startsWith('tr');
  const monthNames = isTR
    ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = isTR
    ? ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: Math.max(4, rect.x),
        top: rect.y,
        zIndex: 125,
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Inline Input */}
      <div
        style={{
          width: Math.max(rect.width, 175),
          height: rect.height,
          backgroundColor: theme.dom.inputBg,
          border: `2px solid ${theme.dom.inputFocusBorder}`,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          boxShadow: theme.dom.popoverShadow,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={textVal}
          placeholder="YYYY-MM-DD HH:mm"
          onChange={(e) => setTextVal(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              e.preventDefault();
              onCommit(textVal, 'down');
            } else if (e.key === 'Tab') {
              e.preventDefault();
              onCommit(textVal, e.shiftKey ? 'left' : 'right');
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onCancel();
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            padding: '0 8px',
            boxSizing: 'border-box',
            backgroundColor: 'transparent',
            color: theme.dom.inputText,
            border: 'none',
            outline: 'none',
            fontFamily: theme.fontFamily,
            fontSize: `${theme.fontSize}px`,
          }}
        />
      </div>

      {/* Calendar + Time Popover */}
      <div
        style={{
          marginTop: 4,
          width: 330,
          padding: 10,
          backgroundColor: theme.dom.popoverBg,
          color: theme.dom.popoverText,
          border: `1px solid ${theme.dom.popoverBorder}`,
          borderRadius: 10,
          boxShadow: theme.dom.popoverShadow,
          backdropFilter: theme.dom.glassBackdrop,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Left: Calendar */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  border: `1px solid ${theme.dom.popoverBorder}`,
                  backgroundColor: 'transparent',
                  color: theme.dom.popoverText,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ‹
              </button>
              <div style={{ fontWeight: 600, fontSize: 12 }}>
                {monthNames[viewMonth - 1]} {viewYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  border: `1px solid ${theme.dom.popoverBorder}`,
                  backgroundColor: 'transparent',
                  color: theme.dom.popoverText,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ›
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 2,
                marginBottom: 4,
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 600,
                color: '#8E8E93',
              }}
            >
              {weekDays.map((wd) => (
                <div key={wd}>{wd}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {cells.map((day, idx) => {
                if (day === null) return <div key={`e_${idx}`} style={{ height: 24 }} />;
                const isSelectedDay = day === selDay;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => updateParts(viewYear, viewMonth, day, selHour, selMinute)}
                    onDoubleClick={() => {
                      const nextStr = buildFormatted(viewYear, viewMonth, day, selHour, selMinute);
                      onCommit(nextStr, 'none');
                    }}
                    style={{
                      height: 24,
                      borderRadius: 5,
                      border: 'none',
                      backgroundColor: isSelectedDay ? theme.dom.accentColor : 'transparent',
                      color: isSelectedDay ? '#FFFFFF' : theme.dom.popoverText,
                      fontWeight: isSelectedDay ? 700 : 500,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Hour & Minute Columns */}
          <div
            style={{
              width: 98,
              borderLeft: `1px solid ${theme.dom.popoverBorder}`,
              paddingLeft: 8,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#8E8E93',
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              {isTR ? 'SAAT : DK' : 'HR : MIN'}
            </div>
            <div style={{ display: 'flex', gap: 4, height: 170 }}>
              {/* Hours */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {hours.map((h) => {
                  const active = h === selHour;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => updateParts(viewYear, viewMonth, selDay, h, selMinute)}
                      style={{
                        padding: '3px 0',
                        fontSize: 11,
                        fontFamily: 'monospace',
                        fontWeight: active ? 700 : 500,
                        borderRadius: 4,
                        border: 'none',
                        backgroundColor: active ? theme.dom.accentColor : 'transparent',
                        color: active ? '#FFFFFF' : theme.dom.popoverText,
                        cursor: 'pointer',
                      }}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
              {/* Minutes */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {minutes.map((m) => {
                  const active = m === selMinute;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateParts(viewYear, viewMonth, selDay, selHour, m)}
                      style={{
                        padding: '3px 0',
                        fontSize: 11,
                        fontFamily: 'monospace',
                        fontWeight: active ? 700 : 500,
                        borderRadius: 4,
                        border: 'none',
                        backgroundColor: active ? theme.dom.accentColor : 'transparent',
                        color: active ? '#FFFFFF' : theme.dom.popoverText,
                        cursor: 'pointer',
                      }}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
            paddingTop: 8,
            borderTop: `1px solid ${theme.dom.popoverBorder}`,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => onCommit('', 'none')}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 4,
                border: `1px solid ${theme.dom.popoverBorder}`,
                backgroundColor: 'transparent',
                color: theme.dom.popoverText,
                cursor: 'pointer',
              }}
            >
              {locale?.clear || (isTR ? 'Temizle' : 'Clear')}
            </button>
            <button
              type="button"
              onClick={handleSelectNow}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 4,
                border: `1px solid ${theme.dom.popoverBorder}`,
                backgroundColor: 'transparent',
                color: theme.dom.accentColor,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isTR ? 'Şimdi' : 'Now'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onCommit(textVal, 'none')}
            style={{
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 4,
              border: 'none',
              backgroundColor: theme.dom.accentColor,
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            {locale?.apply || (isTR ? 'Uygula' : 'Apply')}
          </button>
        </div>
      </div>
    </div>
  );
};
