import type { ColumnDef } from './column';
import type { FilterDef } from './filter';
import type { ActionDef, ExportDef } from './action';
import type { PaginationData } from './pagination';

export interface EmptyStateDef {
  title: string;
  message?: string;
  icon?: string;
  action?: {
    label: string;
    url: string;
  } | null;
}

export interface ViewDef {
  id: number;
  title: string;
  requestPayload: Record<string, any>;
}

export interface TableMeta {
  columns: ColumnDef[];
  filters: FilterDef[];
  actions: {
    row: ActionDef[];
    bulk: ActionDef[];
  };
  exports: ExportDef[];
  search: {
    enabled: boolean;
    placeholder: string;
  };
  perPageOptions: number[];
  softDeletes: boolean;
  stickyHeader: boolean;
  debounce: number;
  scrollPosition: string;
  views: ViewDef[];
  emptyState: EmptyStateDef | null;
}

export interface TableResponse<T = any> {
  meta: TableMeta;
  data: T[];
  pagination: PaginationData;
}
