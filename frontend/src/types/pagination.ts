export interface PaginationData {
  type: 'full' | 'simple' | 'cursor';
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  nextCursor?: string | null;
  previousCursor?: string | null;
}
