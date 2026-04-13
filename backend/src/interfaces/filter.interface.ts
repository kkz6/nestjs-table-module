import { Clause } from '../enums';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSerialized {
  key: string;
  label: string;
  type: string;
  clauses: Clause[];
  options?: FilterOption[];
  multiple?: boolean;
  hidden?: boolean;
  default?: {
    value: any;
    clause: Clause;
  } | null;
}

export interface FilterState {
  enabled: boolean;
  value: any;
  clause: Clause;
}
