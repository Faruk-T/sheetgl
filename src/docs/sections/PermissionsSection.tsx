import React, { useState } from 'react';
import { MaterialIcon } from '../../datagrid/ui/MaterialIcon';
import { DocThemeColors } from '../types';
import { ALL_COLUMNS_DEMO_DATA, DOC_STATUS_OPTIONS } from '../data/docOptionsAndRows';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { CodeBlock } from '../components/CodeBlock';

export interface PermissionsSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  const [permModeDemo, setPermModeDemo] = useState<'write' | 'readonly'>('write');

  return (
    <div>
      <div id="perm-live" style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setPermModeDemo((m) => (m === 'write' ? 'readonly' : 'write'))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: `1px solid ${colors.accent}`,
            backgroundColor: colors.accentBg,
            color: colors.accent,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <MaterialIcon
            name={permModeDemo === 'write' ? 'lock_open' : 'lock'}
            size={16}
            color={colors.accent}
          />
          <span>
            {permModeDemo === 'write'
              ? isTR
                ? 'Tablo Modu: Yazılabilir (Write) — Salt Okunur Yapmak İçin Tıklayın'
                : 'Grid Mode: Writable (Write) — Click to Switch to Read-Only'
              : isTR
              ? 'Tablo Modu: Salt Okunur (Read-Only) — Yazılabilir Yapmak İçin Tıklayın'
              : 'Grid Mode: Read-Only — Click to Switch to Writable'}
          </span>
        </button>
      </div>

      <LiveDemoBox
        title={
          isTR
            ? '3 Katmanlı Yetkilendirme Canlı Test Tablosu'
            : '3-Tier Permissions Live Interactive Grid'
        }
        subtitle={
          isTR
            ? "1) ID sütunu sütun bazlı kilitlidir (🔒). 2) Durumu 'Rejected' olan 3. satırın Bakiye hücresi canEdit kuralıyla kilitlidir."
            : "1) ID column is locked at the column tier (🔒). 2) Row #3 has status 'Rejected', so its Balance cell is dynamically locked by canEdit."
        }
        hints={
          isTR
            ? [
                '3. satırdaki (Rejected) Bakiye hücresine çift tıklayın → Satır bazlı kilit uyarısı verir!',
                '1. veya 2. satırdaki Bakiye hücresine çift tıklayın → Düzenlenebilir!',
              ]
            : [
                'Double-click Balance on Row #3 (Rejected) → Blocked by row-level canEdit lock!',
                'Double-click Balance on Row #1 or #2 → Editable!',
              ]
        }
        height={235}
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        data={ALL_COLUMNS_DEMO_DATA}
        permissions={{ mode: permModeDemo }}
        columns={[
          {
            id: 'id',
            title: isTR ? 'ID (Sütun Kilidi)' : 'ID (Column Lock)',
            type: 'number',
            decimalDigits: 0,
            width: 135,
            permission: 'readonly',
          },
          { id: 'company', title: isTR ? 'Şirket Adı' : 'Company Name', type: 'text', width: 200 },
          { id: 'status', title: isTR ? 'Durum' : 'Status', type: 'select', width: 145, options: DOC_STATUS_OPTIONS },
          {
            id: 'balance',
            title: isTR ? 'Bakiye (Rejected Satırda Kilitli)' : 'Balance (Locked if Rejected)',
            type: 'currency',
            width: 240,
            currencySymbol: '$',
            canEdit: (row) => row.status !== 'rejected',
          },
        ]}
      />

      <div id="perm-code">
        <CodeBlock
          id="perm-code-block"
          title={isTR ? '3 Katmanlı Yetkilendirme Kodu' : '3-Tier Permissions Configuration'}
          langBadge="TSX"
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          code={`<SheetGL
  dataSource={data}
  // 1. Grid Tier
  permissions={{
    mode: 'write', // 'write' | 'readonly' | 'read'
    allowAdding: true,
    allowUpdating: true,
    allowDeleting: true,
  }}
  columns={[
    // 2. Column Tier (Renders lock badge in header)
    { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, permission: 'readonly' },

    // 3. Row / Cell Tier (Dynamic Condition)
    {
      id: 'balance',
      title: 'Gross Balance ($)',
      type: 'currency',
      canEdit: (row) => row.status !== 'rejected',
    },
  ]}
/>`}
        />
      </div>
    </div>
  );
};
