# NestJS Table Module Documentation

A full-stack, batteries-included data table module for NestJS + Vue. Define columns, filters, actions, and exports on the backend with a fluent builder API -- the frontend renders everything automatically.

---

## Documentation

### Core Concepts

- **[Pagination](./pagination.md)** -- Full (page numbers), Simple (prev/next), and Cursor-based pagination. Per-page options, defaults, and frontend rendering.
- **[Search](./search.md)** -- Global search across columns. Column-level and config-level search, ILIKE queries, debouncing, and URL sync.
- **[Soft Deletes](./soft-deletes.md)** -- TypeORM soft delete integration. Auto-added TrashedFilter, restore/forceDelete actions, and query modifications.
- **[Saved Views](./saved-views.md)** -- Persist filter/sort/column state as named views. Per-user scoping, REST endpoints, and the TableView entity.
- **[Empty States](./empty-states.md)** -- Configurable empty state with title, message, icon, and call-to-action. Builder API and frontend rendering.

### Frontend

- **[Frontend Components](./frontend-components.md)** -- Complete reference for every Vue component: DataTable, SearchInput, TablePagination, ToggleColumnsDropdown, EmptyState, ConfirmDialog, ExportButton, ExportProgressOverlay, filter components, action components, and cell renderers.
- **[Composables](./composables.md)** -- Full API for `useTable`, `useFilters`, `useActions`, `useExport`, and `useStickyTable`. State, methods, URL sync, debouncing, and SSE lifecycle.

### Reference

- **[API Reference](./api-reference.md)** -- Complete REST API documentation. Table data endpoint, actions, exports (with SSE streaming), saved views, request/response formats, and the full TableResponse contract.

---

## Quick Links

| Task                        | Page                                              |
|-----------------------------|---------------------------------------------------|
| Set up pagination           | [Pagination](./pagination.md)                     |
| Add global search           | [Search](./search.md)                             |
| Enable soft deletes         | [Soft Deletes](./soft-deletes.md)                 |
| Save table views            | [Saved Views](./saved-views.md)                   |
| Customize empty states      | [Empty States](./empty-states.md)                 |
| Use the DataTable component | [Frontend Components](./frontend-components.md)   |
| Use the useTable composable | [Composables](./composables.md)                   |
| Integrate with the REST API | [API Reference](./api-reference.md)               |

---

## Architecture Overview

```
Backend (NestJS)                          Frontend (Vue)
┌─────────────────────────┐              ┌────────────────────────────┐
│  @TableConfig decorator  │              │  DataTable.vue             │
│  BaseTable subclass      │              │    ├── SearchInput         │
│    ├── columns()         │              │    ├── AddFilterDropdown   │
│    ├── filters()         │              │    ├── ActiveFilters       │
│    ├── actions()         │   HTTP/JSON  │    ├── ToggleColumnsDropdown│
│    ├── exports()         │◄────────────►│    ├── ExportButton        │
│    └── emptyState()      │              │    ├── TablePagination     │
│                          │              │    ├── CellRenderer        │
│  TableQueryService       │              │    ├── RowActions          │
│  TableActionController   │              │    ├── BulkActionsDropdown │
│  TableExportController   │              │    ├── ConfirmDialog       │
│  TableViewController     │              │    └── EmptyState          │
│  TableSseService         │     SSE      │                            │
│  TableExportService      │─────────────►│  Composables:              │
│  TableViewService        │              │    useTable, useFilters,   │
│  TableRegistry           │              │    useActions, useExport,  │
└─────────────────────────┘              │    useStickyTable          │
                                         └────────────────────────────┘
```
