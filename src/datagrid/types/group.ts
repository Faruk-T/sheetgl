export interface GroupDescriptor {
  selector: string;
  isExpanded?: boolean;
}

export type SummaryType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'none';

export interface SummaryDescriptor {
  selector: string;
  summaryType: SummaryType;
  label?: string;
}

export interface ComputedSummaryValue {
  selector: string;
  summaryType: SummaryType;
  value: number;
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
      summaryTypes?: Record<string, SummaryType>;
    }
  | {
      type: 'data';
      rawIndex: number;
      data: Record<string, any>;
    };
