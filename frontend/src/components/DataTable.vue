<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import { useTable, type UseTableOptions } from '@/composables/useTable';
import { useActions } from '@/composables/useActions';
import { useExport } from '@/composables/useExport';
import { useStickyTable } from '@/composables/useStickyTable';
import { Checkbox } from '@/components/ui/checkbox';
import { CellRenderer } from '@/components/columns';
import { AddFilterDropdown, ActiveFilters } from '@/components/filters';
import { RowActions, BulkActionsDropdown } from '@/components/actions';
import SearchInput from './SearchInput.vue';
import ToggleColumnsDropdown from './ToggleColumnsDropdown.vue';
import TablePagination from './TablePagination.vue';
import EmptyState from './EmptyState.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import ExportButton from './ExportButton.vue';
import ExportProgressOverlay from './ExportProgressOverlay.vue';

const props = withDefaults(defineProps<{
  endpoint: string;
  defaultPerPage?: number;
  debounce?: number;
  syncUrl?: boolean;
  tableClass?: string;
}>(), {
  defaultPerPage: 15,
  debounce: 300,
  syncUrl: true,
  tableClass: '',
});

const {
  data, meta, pagination, isLoading, isEmpty,
  sortColumn, sortDirection, search, activeFilters, visibleColumns,
  setPage, setPerPage, setSort, setSearch,
  addFilter, removeFilter, updateFilter, toggleColumn, refresh,
} = useTable(props.endpoint, {
  defaultPerPage: props.defaultPerPage,
  debounce: props.debounce,
  syncUrl: props.syncUrl,
});

const {
  selectedIds, hasSelection, selectedCount, confirmAction,
  toggleSelect, toggleSelectAll, executeAction, executeConfirmedAction, cancelAction,
} = useActions();

const { isExporting, exportProgress, triggerExport } = useExport();
const { tableRef, headerStuck } = useStickyTable();

const visibleColumnDefs = computed(() => {
  if (!meta.value) return [];
  return meta.value.columns.filter(c => {
    if (c.type === 'action') return true;
    if (visibleColumns.value.length === 0) return c.visible;
    return visibleColumns.value.includes(c.key);
  });
});

const hasBulkActions = computed(() => (meta.value?.actions.bulk.length ?? 0) > 0);
const hasExports = computed(() => (meta.value?.exports.length ?? 0) > 0);
const showCheckboxes = computed(() => hasBulkActions.value || hasExports.value);
const allIds = computed(() => data.value.map((item: any) => String(item.id)));
const allSelected = computed(() => allIds.value.length > 0 && selectedIds.value.size === allIds.value.length);

function handleRowAction(action: any, row: any) {
  executeAction(props.tableClass || meta.value?.columns?.[0]?.key || '', action, { id: String(row.id) });
}

function handleBulkAction(action: any) {
  executeAction(props.tableClass || '', action, { ids: Array.from(selectedIds.value) });
}

function handleExport(exportDef: any) {
  triggerExport(props.tableClass || '', exportDef.name);
}

function handleConfirm() {
  executeConfirmedAction(props.tableClass || '');
  refresh();
}
</script>
<template>
  <div ref="tableRef" class="w-full">
    <!-- Header toolbar -->
    <div class="flex flex-wrap items-center gap-2 pb-4">
      <SearchInput
        v-if="meta?.search.enabled"
        :model-value="search"
        :placeholder="meta.search.placeholder"
        class="w-64"
        @update:model-value="setSearch"
      />

      <AddFilterDropdown
        v-if="meta?.filters.length"
        :filters="meta.filters"
        :active-filter-keys="Object.keys(activeFilters)"
        @add="(key) => addFilter(key, meta!.filters.find(f => f.key === key)!.clauses[0], '')"
      />

      <ToggleColumnsDropdown
        v-if="meta?.columns.some(c => c.toggleable)"
        :columns="meta.columns"
        :visible-columns="visibleColumns"
        @toggle="toggleColumn"
      />

      <ExportButton
        v-if="meta?.exports.length"
        :exports="meta.exports"
        @export="handleExport"
      />

      <BulkActionsDropdown
        v-if="hasSelection"
        :actions="meta?.actions.bulk ?? []"
        :exports="meta?.exports ?? []"
        :selected-count="selectedCount"
        @action="handleBulkAction"
        @export="handleExport"
      />
    </div>

    <!-- Active filters -->
    <ActiveFilters
      v-if="Object.keys(activeFilters).length > 0 && meta"
      :filters="meta.filters"
      :active-filters="activeFilters"
      class="mb-4"
      @update="(key, clause, value) => updateFilter(key, clause, value)"
      @remove="removeFilter"
    />

    <!-- Table -->
    <div class="rounded-md border">
      <div class="relative overflow-auto">
        <table class="w-full caption-bottom text-sm">
          <thead :class="cn('border-b', meta?.stickyHeader && headerStuck && 'sticky top-0 z-10 bg-background shadow-sm')">
            <tr>
              <th v-if="showCheckboxes" class="w-10 px-4 py-3">
                <Checkbox :checked="allSelected" @update:checked="toggleSelectAll(allIds)" />
              </th>
              <th
                v-for="col in visibleColumnDefs"
                :key="col.key"
                :class="cn('h-10 px-4 font-medium text-muted-foreground', col.headerClass, `text-${col.alignment}`)"
                class="cursor-default"
                @click="col.sortable && setSort(col.key)"
              >
                <div class="flex items-center gap-1" :class="{ 'cursor-pointer select-none': col.sortable }">
                  {{ col.header }}
                  <template v-if="col.sortable && sortColumn === col.key">
                    <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 15 7-7 7 7" /></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 9-7 7-7-7" /></svg>
                  </template>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in data"
              :key="(row as any).id"
              class="border-b transition-colors hover:bg-muted/50"
            >
              <td v-if="showCheckboxes" class="px-4 py-3">
                <Checkbox :checked="selectedIds.has(String((row as any).id))" @update:checked="toggleSelect(String((row as any).id))" />
              </td>
              <td
                v-for="col in visibleColumnDefs"
                :key="col.key"
                :class="cn('px-4 py-3', col.cellClass, `text-${col.alignment}`)"
              >
                <RowActions
                  v-if="col.type === 'action' && (row as any)._actions"
                  :actions="(row as any)._actions"
                  :row="row as any"
                  :as-dropdown="col.asDropdown"
                  @action="handleRowAction"
                />
                <CellRenderer v-else :value="(row as any)[col.key]" :column="col" />
              </td>
            </tr>
          </tbody>
        </table>

        <EmptyState v-if="isEmpty && !isLoading" :config="meta?.emptyState" />

        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-background/50">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <TablePagination
      v-if="pagination && pagination.total > 0"
      :pagination="pagination"
      :per-page-options="meta?.perPageOptions ?? [15, 30, 50, 100]"
      @page="setPage"
      @per-page="setPerPage"
    />

    <!-- Confirm dialog -->
    <ConfirmDialog
      v-if="confirmAction"
      :action="confirmAction"
      @confirm="handleConfirm"
      @cancel="cancelAction"
    />

    <!-- Export progress -->
    <ExportProgressOverlay v-if="isExporting" :progress="exportProgress" />
  </div>
</template>
