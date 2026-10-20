export type FilterOperation =
  | 'contains'
  | 'notcontains'
  | 'startswith'
  | 'endswith'
  | '='
  | '<>'
  | '<'
  | '<='
  | '>'
  | '>='
  | 'between'
  | 'in'
  | 'notin';

export type SingleFilter = [string, FilterOperation, any];
export type CompositeFilter = (SingleFilter | 'and' | 'or' | CompositeFilter)[];
export type FilterDescriptor = SingleFilter | CompositeFilter | any[];

export interface SortDescriptor {
  selector: string;
  desc: boolean;
}

export interface DistinctItem {
  value: any;
  label: string;
  count?: number;
}

export interface SearchDescriptor {
  keyword: string;
  columns?: string[];
}
