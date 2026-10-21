import React from 'react';

/**
 * Lightweight syntax highlighter for TSX / Bash code blocks in DocsPortal.
 */
export function renderHighlightedLine(line: string, isDark: boolean): React.ReactNode {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
    return (
      <span style={{ color: '#64748B', fontStyle: 'italic' }}>
        {line}
      </span>
    );
  }

  const tokenRegex =
    /(\/\/.*$|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\b(?:import|from|export|default|const|let|var|function|return|async|await|if|else|true|false|null|undefined|new|type|interface)\b|\b(?:SheetGL|ColumnDef|LocalDataStore|RemoteDataStore|ValidationEngine|Deferred|createDeferred|ColumnTypeRegistry|ThemeEngine|LocaleEngine|MaterialIcon|Promise)\b|\b\d+(?:\.\d+)?\b)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const token = match[0];
    let color = isDark ? '#E2E8F0' : '#0F172A';
    let weight: number | undefined = undefined;

    if (token.startsWith('//')) {
      color = '#64748B';
    } else if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
      color = isDark ? '#34D399' : '#059669';
    } else if (
      /^(import|from|export|default|const|let|var|function|return|async|await|if|else|new|type|interface)$/.test(
        token
      )
    ) {
      color = isDark ? '#C084FC' : '#7C3AED';
      weight = 600;
    } else if (/^(true|false|null|undefined)$/.test(token)) {
      color = isDark ? '#F472B6' : '#DB2777';
      weight = 600;
    } else if (
      /^(SheetGL|ColumnDef|LocalDataStore|RemoteDataStore|ValidationEngine|Deferred|createDeferred|ColumnTypeRegistry|ThemeEngine|LocaleEngine|MaterialIcon|Promise)$/.test(
        token
      )
    ) {
      color = isDark ? '#38BDF8' : '#0284C7';
      weight = 600;
    } else if (/^\d/.test(token)) {
      color = isDark ? '#FBBF24' : '#D97706';
    }

    parts.push(
      <span key={match.index} style={{ color, fontWeight: weight }}>
        {token}
      </span>
    );
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line || ' ';
}
