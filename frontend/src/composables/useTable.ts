import { ref, reactive, computed, onMounted, type Ref } from 'vue';
import type { TableMeta, TableResponse, PaginationData } from '../types';

export interface UseTableOptions {
  defaultPerPage?: number;
  debounce?: number;
  syncUrl?: boolean;
}

export function useTable<T = any>(endpoint: string, options: UseTableOptions = {}) {
  const data = ref<T[]>([]) as Ref<T[]>;
  const meta = ref<TableMeta | null>(null);
  const pagination = ref<PaginationData | null>(null);
  const isLoading = ref(false);
  const isEmpty = computed(() => !isLoading.value && data.value.length === 0);

  const currentPage = ref(1);
  const perPage = ref(options.defaultPerPage ?? 15);
  const sortColumn = ref<string | null>(null);
  const sortDirection = ref<'asc' | 'desc'>('asc');
  const search = ref('');
  const activeFilters = reactive<Record<string, Record<string, string>>>({});
  const visibleColumns = ref<string[]>([]);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function initFromUrl() {
    if (!options.syncUrl || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('page')) currentPage.value = Number(params.get('page'));
    if (params.get('limit')) perPage.value = Number(params.get('limit'));
    if (params.get('sort')) {
      const [col, dir] = params.get('sort')!.split(':');
      sortColumn.value = col;
      sortDirection.value = (dir as 'asc' | 'desc') || 'asc';
    }
    if (params.get('search')) search.value = params.get('search')!;
    params.forEach((value, key) => {
      const match = key.match(/^filters\[(\w+)]\[(\w+)]$/);
      if (match) {
        const [, filterKey, clause] = match;
        if (!activeFilters[filterKey]) activeFilters[filterKey] = {};
        activeFilters[filterKey][clause] = value;
      }
    });
  }

  function buildQueryString(): string {
    const params = new URLSearchParams();
    params.set('page', String(currentPage.value));
    params.set('limit', String(perPage.value));
    if (sortColumn.value) params.set('sort', `${sortColumn.value}:${sortDirection.value}`);
    if (search.value) params.set('search', search.value);
    for (const [key, clauseMap] of Object.entries(activeFilters)) {
      for (const [clause, value] of Object.entries(clauseMap)) {
        params.set(`filters[${key}][${clause}]`, value);
      }
    }
    if (visibleColumns.value.length > 0) {
      params.set('columns', visibleColumns.value.join(','));
    }
    return params.toString();
  }

  function syncToUrl() {
    if (!options.syncUrl || typeof window === 'undefined') return;
    const queryString = buildQueryString();
    const url = `${window.location.pathname}?${queryString}`;
    window.history.replaceState({}, '', url);
  }

  async function fetchData() {
    isLoading.value = true;
    try {
      const queryString = buildQueryString();
      const response = await fetch(`${endpoint}?${queryString}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result: TableResponse<T> = await response.json();
      data.value = result.data;
      meta.value = result.meta;
      pagination.value = result.pagination;
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function debouncedFetch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncToUrl();
      fetchData();
    }, options.debounce ?? 300);
  }

  function setPage(page: number) {
    currentPage.value = page;
    syncToUrl();
    fetchData();
  }

  function setPerPage(value: number) {
    perPage.value = value;
    currentPage.value = 1;
    syncToUrl();
    fetchData();
  }

  function setSort(column: string) {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn.value = column;
      sortDirection.value = 'asc';
    }
    currentPage.value = 1;
    syncToUrl();
    fetchData();
  }

  function setSearch(value: string) {
    search.value = value;
    currentPage.value = 1;
    debouncedFetch();
  }

  function addFilter(key: string, clause: string, value: string) {
    if (!activeFilters[key]) activeFilters[key] = {};
    activeFilters[key][clause] = value;
    currentPage.value = 1;
    debouncedFetch();
  }

  function removeFilter(key: string) {
    delete activeFilters[key];
    currentPage.value = 1;
    debouncedFetch();
  }

  function updateFilter(key: string, clause: string, value: string) {
    activeFilters[key] = { [clause]: value };
    currentPage.value = 1;
    debouncedFetch();
  }

  function toggleColumn(key: string) {
    const idx = visibleColumns.value.indexOf(key);
    if (idx >= 0) {
      visibleColumns.value.splice(idx, 1);
    } else {
      visibleColumns.value.push(key);
    }
  }

  function refresh() {
    fetchData();
  }

  onMounted(() => {
    initFromUrl();
    fetchData();
  });

  return {
    data, meta, pagination, isLoading, isEmpty,
    currentPage, perPage, sortColumn, sortDirection, search, activeFilters, visibleColumns,
    setPage, setPerPage, setSort, setSearch,
    addFilter, removeFilter, updateFilter,
    toggleColumn, refresh,
  };
}
