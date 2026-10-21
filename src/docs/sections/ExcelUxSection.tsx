import React from 'react';
import { DocThemeColors } from '../types';
import { SimpleTable } from '../components/SimpleTable';

export interface ExcelUxSectionProps {
  isTR: boolean;
  colors: DocThemeColors;
}

export const ExcelUxSection: React.FC<ExcelUxSectionProps> = ({ isTR, colors }) => {
  return (
    <div id="ux-table">
      <SimpleTable
        colors={colors}
        headers={
          isTR
            ? ['Kısayol / Eylem', 'İşlev ve Davranış']
            : ['Shortcut / Gesture', 'Behavior']
        }
        rows={
          isTR
            ? [
                ['Fill Handle (Sağ Alt Kare)', 'Sürükleyerek hücreleri otomatik doldurur ve seri kodları artırır (ACC-100001 → ACC-100002)'],
                ['Hücre Sağ Yan (+) Butonu', 'Tıklayarak veya sürükleyerek aktif hücreyi komşu hücrelere hızlıca çoğaltır'],
                ['Ctrl + D / Ctrl + R', 'Seçili hücreyi aşağı (Fill Down) veya sağa (Fill Right) çoğaltır'],
                ['Shift + D', 'Aktif satırı olduğu gibi hemen altına yeni satır olarak çoğaltır (Duplicate Row)'],
                ['Ctrl + C / Ctrl + V', 'Microsoft Excel ve Google Sheets ile birebir uyumlu TSV kopyala ve yapıştır'],
                ['Ctrl + Z / Ctrl + Y', 'Kademeli (cascading) güncellemeleri de kapsayan 100 adımlı Geri Al (Undo) ve İleri Al (Redo)'],
                ['F2 / Çift Tıklama', 'Aktif hücrenin Micro-DOM düzenleyicisini açar'],
                ['Enter / Tab', 'Değeri doğrular, kaydeder ve bir alt / sağ hücreye geçer'],
              ]
            : [
                ['Fill Handle (Bottom-Right Square)', 'Drag across rows/columns to auto-fill values and increment series codes (ACC-100001 → ACC-100002)'],
                ['Right-Side (+) Handle', 'Click or drag to duplicate active cell into adjacent cells'],
                ['Ctrl + D / Ctrl + R', 'Fill Down / Fill Right across selected cells'],
                ['Shift + D', 'Duplicate Row — clones the entire active record directly underneath'],
                ['Ctrl + C / Ctrl + V', 'Native Microsoft Excel & Google Sheets TSV clipboard copy and paste'],
                ['Ctrl + Z / Ctrl + Y', '100-step Undo / Redo stack (including cascading field updates)'],
                ['F2 / Double-Click', 'Opens the inline Micro-DOM editor for the active cell'],
                ['Enter / Tab', 'Validates, commits, and moves selection down / right'],
              ]
        }
      />
    </div>
  );
};
