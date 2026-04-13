import { ColumnSerialized } from './column.interface';
import { FilterSerialized } from './filter.interface';
import { ActionSerialized } from './action.interface';
import { ExportSerialized } from './export.interface';
import { PaginationType } from '../enums';

export interface EmptyStateSerialized {
  title: string;
  message?: string;
  icon?: string;
  action?: {
    label: string;
    url: string;
  } | null;
}

export interface ViewSerialized {
  id: number;
  title: string;
  requestPayload: Record<string, any>;
}

export interface TableMeta {
  columns: ColumnSerialized[];
  filters: FilterSerialized[];
  actions: {
    row: ActionSerialized[];
    bulk: ActionSerialized[];
  };
  exports: ExportSerialized[];
  search: {
    enabled: boolean;
    placeholder: string;
  };
  perPageOptions: number[];
  softDeletes: boolean;
  stickyHeader: boolean;
  debounce: number;
  scrollPosition: string;
  views: ViewSerialized[];
  emptyState: EmptyStateSerialized | null;
}

export interface PaginationData {
  type: PaginationType;
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  nextCursor?: string | null;
  previousCursor?: string | null;
}

export interface TableResponse<T = any> {
  meta: TableMeta;
  data: T[];
  pagination: PaginationData;
}
