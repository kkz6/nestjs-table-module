export interface ColumnDef {
  type: string;
  key: string;
  header: string;
  sortable: boolean;
  searchable: boolean;
  toggleable: boolean;
  visible: boolean;
  alignment: 'left' | 'center' | 'right';
  wrap: boolean;
  truncate: number | false;
  headerClass: string | null;
  cellClass: string | null;
  stickable: boolean;
  meta: Record<string, any> | null;
  // Boolean extras
  trueIcon?: string | null;
  falseIcon?: string | null;
  trueLabel?: string;
  falseLabel?: string;
  // Badge extras
  variants?: Record<string, string>;
  // Image extras
  imageSize?: string;
  imagePosition?: string;
  fallbackImage?: string | null;
  rounded?: boolean;
  // Action extras
  asDropdown?: boolean;
}
