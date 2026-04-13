import { ColumnAlignment, ImageSize, ImagePosition } from '../enums';

export interface ColumnSerialized {
  type: string;
  key: string;
  header: string;
  sortable: boolean;
  searchable: boolean;
  toggleable: boolean;
  visible: boolean;
  alignment: ColumnAlignment;
  wrap: boolean;
  truncate: number | false;
  headerClass: string | null;
  cellClass: string | null;
  stickable: boolean;
  meta: Record<string, any> | null;
  // BooleanColumn extras
  trueIcon?: string | null;
  falseIcon?: string | null;
  trueLabel?: string;
  falseLabel?: string;
  // BadgeColumn extras
  variants?: Record<string, string>;
  // ImageColumn extras
  imageSize?: ImageSize;
  imagePosition?: ImagePosition;
  fallbackImage?: string | null;
  rounded?: boolean;
  // ActionColumn extras
  asDropdown?: boolean;
}
