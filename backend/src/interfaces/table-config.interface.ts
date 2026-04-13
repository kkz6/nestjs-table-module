import { PaginationType, SortDirection, ScrollPosition } from '../enums';

export interface TableConfigOptions {
  resource: Function; // TypeORM entity class
  defaultSort?: { column: string; direction: SortDirection };
  pagination?: PaginationType;
  perPageOptions?: number[];
  defaultPerPage?: number;
  softDeletes?: boolean;
  searchable?: string[];
  stickyHeader?: boolean;
  debounce?: number;
  scrollPosition?: ScrollPosition;
}
