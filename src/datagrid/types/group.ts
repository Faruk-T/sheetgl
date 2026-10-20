export interface GroupDescriptor {
  selector: string;
  isExpanded?: boolean;
}

export type SummaryType = 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface SummaryDescriptor {
  selector: string;
  summaryType: SummaryType;
}

export type VirtualRow =
  | {
      type: 'group';
      level: number;
      groupKey: string;
      field: string;
      value: any;
      rowCount: number;
      isExpanded: boolean;
      summaries?: Record<string, number>;
    }
  | {
      type: 'data';
      rawIndex: number;
      data: Record<string, any>;
    };
