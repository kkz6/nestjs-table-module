# Composables

The frontend provides four Vue composables that encapsulate all table state management, data fetching, and interaction logic.

---

## useTable

The primary composable that manages table data, pagination, sorting, searching, filtering, and column visibility.

### Signature

```typescript
function useTable<T = any>(
  endpoint: string,
  options?: UseTableOptions
): UseTableReturn<T>
```

### Options

```typescript
interface UseTableOptions {
  defaultPerPage?: number;  // default: 15
  debounce?: number;        // default: 300 (ms)
  syncUrl?: boolean;        // default: false
}
```

| Option          | Type    | Default | Description                                                |
|-----------------|---------|---------|------------------------------------------------------------|
| `defaultPerPage`| number  | `15`    | Initial rows per page                                      |
| `debounce`      | number  | `300`   | Debounce delay in ms for search and filter changes         |
| `syncUrl`       | boolean | `false` | Sync table state to/from URL query parameters              |

### Returned State

| Property          | Type                                           | Description                                 |
|-------------------|------------------------------------------------|---------------------------------------------|
| `data`            | `Ref<T[]>`                                     | The current page of table data              |
| `meta`            | `Ref<TableMeta \| null>`                       | Table metadata (columns, filters, etc.)     |
| `pagination`      | `Ref<PaginationData \| null>`                  | Current pagination state                    |
| `isLoading`       | `Ref<boolean>`                                 | Whether a fetch is in progress              |
| `isEmpty`         | `ComputedRef<boolean>`                         | True when not loading and data is empty     |
| `currentPage`     | `Ref<number>`                                  | Current page number                         |
| `perPage`         | `Ref<number>`                                  | Items per page                              |
| `sortColumn`      | `Ref<string \| null>`                          | Currently sorted column key                 |
| `sortDirection`   | `Ref<'asc' \| 'desc'>`                        | Current sort direction                      |
| `search`          | `Ref<string>`                                  | Current search term                         |
| `activeFilters`   | `Record<string, Record<string, string>>`       | Reactive filter state (key -> clause -> value) |
| `visibleColumns`  | `Ref<string[]>`                                | Array of visible column keys                |

### Methods

#### `setPage(page: number): void`

Navigate to a specific page. Triggers an immediate fetch and URL sync.

#### `setPerPage(value: number): void`

Change the number of items per page. Resets to page 1. Triggers an immediate fetch and URL sync.

#### `setSort(column: string): void`

Toggle sort on a column. If the column is already sorted, the direction flips between `asc` and `desc`. If a different column, sets it to `asc`. Resets to page 1 and fetches immediately.

#### `setSearch(value: string): void`

Update the search term. Resets to page 1. Uses `debouncedFetch()` -- the actual API call is delayed by the configured debounce time.

#### `addFilter(key: string, clause: string, value: string): void`

Add or update a filter. Creates the filter key in `activeFilters` if it does not exist. Resets to page 1 and uses debounced fetch.

#### `removeFilter(key: string): void`

Remove a filter by key. Resets to page 1 and uses debounced fetch.

#### `updateFilter(key: string, clause: string, value: string): void`

Replace a filter's clause and value. Resets to page 1 and uses debounced fetch.

#### `toggleColumn(key: string): void`

Add or remove a column key from `visibleColumns`. Does not trigger a fetch (column visibility is client-side only).

#### `refresh(): void`

Re-fetch data with the current state. Does not debounce.

### URL Sync Behavior

When `syncUrl: true`:

1. **On mount**: The composable reads query parameters from the current URL and initializes state accordingly:
   - `page` -> `currentPage`
   - `limit` -> `perPage`
   - `sort` -> `sortColumn` and `sortDirection` (format: `column:direction`)
   - `search` -> `search`
   - `filters[key][clause]` -> `activeFilters`

2. **On state change**: After each state change (page, sort, filter, etc.), the URL is updated via `window.history.replaceState()` without triggering a page reload.

### Debouncing

Search and filter changes use a debounced fetch. The timer resets on each change, so rapid typing only triggers one API call after the user stops. Page and sort changes fetch immediately (no debounce).

### Initialization

`onMounted`, the composable:
1. Calls `initFromUrl()` to read state from URL parameters (if `syncUrl` is enabled).
2. Calls `fetchData()` to load the initial data.

### Usage

```typescript
import { useTable } from '@nestjs-table-module/frontend';

const {
  data, meta, pagination, isLoading, isEmpty,
  currentPage, perPage, sortColumn, sortDirection,
  search, activeFilters, visibleColumns,
  setPage, setPerPage, setSort, setSearch,
  addFilter, removeFilter, updateFilter,
  toggleColumn, refresh,
} = useTable<User>('/api/users', {
  defaultPerPage: 30,
  debounce: 500,
  syncUrl: true,
});
```

---

## useFilters

A standalone composable for managing filter state. Useful when building custom filter UIs outside of the `DataTable` component.

### Signature

```typescript
function useFilters(): UseFiltersReturn
```

### Returned State

| Property        | Type                                                    | Description                           |
|-----------------|---------------------------------------------------------|---------------------------------------|
| `activeFilters` | `Record<string, { clause: string; value: string }>`     | Reactive map of active filters        |

### Methods

#### `addFilter(key: string, clause: string, value: string): void`

Add a new filter or overwrite an existing one.

```typescript
const { addFilter } = useFilters();
addFilter('status', 'in', 'active');
```

#### `removeFilter(key: string): void`

Remove a filter by key.

```typescript
removeFilter('status');
```

#### `updateClause(key: string, clause: string): void`

Update only the clause of an existing filter, keeping the value.

```typescript
updateClause('name', 'starts_with');
```

#### `updateValue(key: string, value: string): void`

Update only the value of an existing filter, keeping the clause.

```typescript
updateValue('name', 'John');
```

#### `isActive(key: string): boolean`

Check whether a filter is currently active.

```typescript
if (isActive('status')) {
  // ...
}
```

#### `getActiveKeys(): string[]`

Get an array of all active filter keys.

```typescript
const keys = getActiveKeys(); // ['status', 'name']
```

### Usage

```typescript
import { useFilters } from '@nestjs-table-module/frontend';

const {
  activeFilters, addFilter, removeFilter,
  updateClause, updateValue, isActive, getActiveKeys,
} = useFilters();
```

---

## useActions

Manages row selection and action execution, including confirmation dialogs.

### Signature

```typescript
function useActions(): UseActionsReturn
```

### Returned State

| Property         | Type                    | Description                                          |
|------------------|-------------------------|------------------------------------------------------|
| `selectedIds`    | `Ref<Set<string>>`      | Set of selected row IDs                              |
| `allSelected`    | `ComputedRef<boolean>`  | Whether all rows on the current page are selected    |
| `hasSelection`   | `ComputedRef<boolean>`  | Whether any rows are selected                        |
| `selectedCount`  | `ComputedRef<number>`   | Number of selected rows                              |
| `confirmAction`  | `Ref<ActionDef \| null>`| The action awaiting confirmation (if any)            |
| `pendingAction`  | `Ref<object \| null>`   | The pending action and its payload                   |

### Methods

#### `toggleSelect(id: string): void`

Toggle a single row's selection. If already selected, deselects it; otherwise, selects it.

```typescript
toggleSelect('42');
```

#### `toggleSelectAll(ids: string[]): void`

Toggle select/deselect all. If all provided IDs are already selected, clears the selection. Otherwise, selects all.

```typescript
toggleSelectAll(data.map(row => String(row.id)));
```

#### `clearSelection(): void`

Deselect all rows.

#### `executeAction(tableClass: string, action: ActionDef, payload?: { id?: string; ids?: string[] }): Promise<any>`

Execute a row or bulk action. If the action has a `confirm` property, sets `confirmAction` and `pendingAction` instead of executing immediately -- the `ConfirmDialog` component will be shown.

For link-type actions, navigates to the URL directly.

For button-type actions, sends a POST request to `/table/action/:tableClass/:actionName`.

```typescript
// Row action
await executeAction('UsersTable', deleteAction, { id: '42' });

// Bulk action
await executeAction('UsersTable', bulkDeleteAction, { ids: ['1', '2', '3'] });
```

#### `executeConfirmedAction(tableClass: string): Promise<any>`

Execute the pending action after the user has confirmed. Clears `confirmAction` and `pendingAction` and calls `performAction`.

#### `cancelAction(): void`

Cancel the pending action. Clears `confirmAction` and `pendingAction`.

### Action Execution Flow

1. User clicks an action button.
2. `executeAction()` is called.
3. If the action requires confirmation (`action.confirm` is set):
   - `confirmAction` is set, triggering the `ConfirmDialog` to render.
   - `pendingAction` stores the action and payload.
   - User clicks Confirm -> `executeConfirmedAction()` is called.
   - User clicks Cancel -> `cancelAction()` is called.
4. If no confirmation needed, the action executes immediately via a POST request.

### Usage

```typescript
import { useActions } from '@nestjs-table-module/frontend';

const {
  selectedIds, allSelected, hasSelection, selectedCount,
  confirmAction, pendingAction,
  toggleSelect, toggleSelectAll, clearSelection,
  executeAction, executeConfirmedAction, cancelAction,
} = useActions();
```

---

## useExport

Manages export triggering, SSE progress streaming, and download.

### Signature

```typescript
function useExport(): UseExportReturn
```

### Returned State

| Property         | Type               | Description                                |
|------------------|--------------------|--------------------------------------------|
| `isExporting`    | `Ref<boolean>`     | Whether an export is in progress           |
| `exportProgress` | `Ref<number>`      | Current export progress (0-100)            |
| `exportError`    | `Ref<string\|null>`| Error message if the export failed         |

### Methods

#### `triggerExport(tableClass: string, exportName: string, queryParams?: Record<string, any>, selectedIds?: string[]): Promise<void>`

Initiates an export workflow:

1. **POST** to `/table/export/:tableClass/:exportName` to create an export job. Returns a `{ jobId }`.
2. Opens an **SSE connection** to `/table/export/stream/:jobId` to receive progress updates.
3. As SSE events arrive, updates `exportProgress`.
4. When the event reports `status: 'completed'`, closes the SSE connection, sets `isExporting` to false, and navigates to the `downloadUrl` to trigger the file download.
5. If the event reports `status: 'failed'`, closes the connection and sets `exportError`.
6. If the SSE connection errors out, sets `exportError` to `"Connection lost"`.

```typescript
await triggerExport('UsersTable', 'Excel');
```

#### `resetExport(): void`

Reset all export state. Useful for clearing error states.

```typescript
resetExport();
```

### SSE Connection Lifecycle

```
Frontend                          Backend
   |                                 |
   |-- POST /table/export/...  ---->|  Creates ExportJobEntity
   |<-- { jobId: "abc-123" }  ------|
   |                                 |
   |-- GET /table/export/stream/abc-123 (SSE) -->|
   |<-- data: { status: "processing", progress: 0 } ---|
   |<-- data: { status: "processing", progress: 50 } --|
   |<-- data: { status: "completed", progress: 100, downloadUrl: "..." } --|
   |                                 |
   |-- GET /table/export/download/abc-123 -->|  File download
```

### Usage

```typescript
import { useExport } from '@nestjs-table-module/frontend';

const { isExporting, exportProgress, exportError, triggerExport, resetExport } = useExport();
```

---

## useStickyTable

Detects sticky header state and horizontal scroll position using IntersectionObserver and scroll events.

### Signature

```typescript
function useStickyTable(): UseStickyTableReturn
```

### Returned State

| Property        | Type               | Description                                          |
|-----------------|--------------------|------------------------------------------------------|
| `tableRef`      | `Ref<HTMLElement \| null>` | Template ref to bind to the table container  |
| `headerStuck`   | `Ref<boolean>`     | True when the header is in its "stuck" position      |
| `scrolledLeft`  | `Ref<boolean>`     | True when the table is scrolled away from the left   |
| `scrolledRight` | `Ref<boolean>`     | True when the table can be scrolled further right    |

### How IntersectionObserver Works

On mount, the composable:

1. Creates a 1px sentinel `<div>` and prepends it to the `tableRef` element.
2. Creates an `IntersectionObserver` that watches the sentinel.
3. When the sentinel scrolls out of view (header becomes sticky), `headerStuck` becomes `true`.
4. When the sentinel is visible again (header is in normal flow), `headerStuck` becomes `false`.

This approach avoids `scroll` event listeners for the sticky detection and is performant.

### Horizontal Scroll Detection

The composable also attaches a `scroll` event listener to the `.overflow-auto` container inside the table:

- `scrolledLeft`: `true` when `scrollLeft > 0`.
- `scrolledRight`: `true` when the container has more content to the right (`scrollLeft < scrollWidth - clientWidth - 1`).

These values can be used to show shadow indicators on the left/right edges of a horizontally scrollable table.

### Cleanup

On unmount, the composable disconnects the IntersectionObserver and removes the scroll event listener.

### Usage

```vue
<script setup>
import { useStickyTable } from '@nestjs-table-module/frontend';

const { tableRef, headerStuck, scrolledLeft, scrolledRight } = useStickyTable();
</script>

<template>
  <div ref="tableRef" :class="{ 'shadow-left': scrolledLeft, 'shadow-right': scrolledRight }">
    <div class="overflow-auto">
      <table>
        <thead :class="{ 'sticky top-0 z-10 bg-white shadow-sm': headerStuck }">
          <!-- ... -->
        </thead>
      </table>
    </div>
  </div>
</template>
```
