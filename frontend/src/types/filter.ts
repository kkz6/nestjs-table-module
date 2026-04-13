export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  type: string;
  clauses: string[];
  options?: FilterOption[];
  multiple?: boolean;
  hidden?: boolean;
  default?: {
    value: any;
    clause: string;
  } | null;
}
