# NestJS + Vue Table Module — Design Document

## Overview

Full port of the Laravel/React InertiaUI Table Module to NestJS + Vue 3. Designed as a drop-in module for projects using the [brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate).

## Stack

- **Backend:** NestJS module, TypeORM (relational only), class-validator, ExcelJS + PDFKit
- **Frontend:** Vue 3, shadcn-vue, Tailwind CSS
- **Communication:** REST API (no Inertia)
- **Async Exports:** In-process with SSE for real-time progress (no Redis/BullMQ)

## Directory Structure

```
modules/table/
├── backend/
│   ├── table.module.ts
│   ├── decorators/                   # @TableConfig decorator
│   ├── dto/
│   │   ├── table-query.dto.ts        # Pagination, sort, filter, search params
│   │   ├── action-request.dto.ts     # Row/bulk action payloads
│   │   ├── export-request.dto.ts     # Export trigger payload
│   │   └── view.dto.ts              # Saved view CRUD DTOs
│   ├── entities/
│   │   ├── table-view.entity.ts      # Saved views
│   │   └── export-job.entity.ts      # Export job tracking
│   ├── controllers/
│   │   ├── table-action.controller.ts
│   │   ├── table-export.controller.ts
│   │   └── table-view.controller.ts
│   ├── services/
│   │   ├── table-query.service.ts    # Query building (filters, sort, search)
│   │   ├── table-export.service.ts   # Export generation
│   │   ├── table-view.service.ts     # Saved views CRUD
│   │   └── table-sse.service.ts      # SSE event emitter for exports
│   ├── columns/
│   │   ├── column.ts                 # Base column class
│   │   ├── text-column.ts
│   │   ├── numeric-column.ts
│   │   ├── date-column.ts
│   │   ├── date-time-column.ts
│   │   ├── boolean-column.ts
│   │   ├── badge-column.ts
│   │   ├── image-column.ts
│   │   └── action-column.ts
│   ├── filters/
│   │   ├── filter.ts                 # Base filter class
│   │   ├── text-filter.ts
│   │   ├── numeric-filter.ts
│   │   ├── date-filter.ts
│   │   ├── boolean-filter.ts
│   │   ├── set-filter.ts
│   │   └── trashed-filter.ts
│   ├── enums/
│   │   ├── pagination-type.enum.ts
│   │   ├── sort-direction.enum.ts
│   │   ├── clause.enum.ts
│   │   ├── alignment.enum.ts
│   │   ├── variant.enum.ts
│   │   ├── action-type.enum.ts
│   │   ├── export-format.enum.ts
│   │   ├── image-size.enum.ts
│   │   ├── image-position.enum.ts
│   │   └── scroll-position.enum.ts
│   ├── interfaces/
│   │   ├── table-config.interface.ts
│   │   ├── table-response.interface.ts
│   │   ├── column.interface.ts
│   │   ├── filter.interface.ts
│   │   └── action.interface.ts
│   ├── base-table.ts                 # Abstract base table class
│   ├── table-registry.ts             # Map of table name → table instance
│   ├── action.ts                     # Action builder
│   ├── export.ts                     # Export builder
│   ├── empty-state.ts                # Empty state builder
│   └── views.ts                      # Views management
├── frontend/
│   ├── components/
│   │   ├── DataTable.vue             # Main table component
│   │   ├── TableHeader.vue
│   │   ├── TableBody.vue
│   │   ├── TablePagination.vue
│   │   ├── SearchInput.vue
│   │   ├── EmptyState.vue
│   │   ├── ConfirmDialog.vue
│   │   ├── columns/
│   │   │   ├── TextCell.vue
│   │   │   ├── NumericCell.vue
│   │   │   ├── DateCell.vue
│   │   │   ├── DateTimeCell.vue
│   │   │   ├── BooleanCell.vue
│   │   │   ├── BadgeCell.vue
│   │   │   ├── ImageCell.vue
│   │   │   └── ActionCell.vue
│   │   ├── filters/
│   │   │   ├── AddFilterDropdown.vue
│   │   │   ├── ActiveFilters.vue
│   │   │   ├── FilterChip.vue
│   │   │   ├── TextFilterInput.vue
│   │   │   ├── NumericFilterInput.vue
│   │   │   ├── DateFilterInput.vue
│   │   │   ├── BooleanFilterInput.vue
│   │   │   └── SetFilterInput.vue
│   │   ├── actions/
│   │   │   ├── RowActions.vue
│   │   │   ├── BulkActionsDropdown.vue
│   │   │   └── ActionsDropdown.vue
│   │   └── exports/
│   │       ├── ExportButton.vue
│   │       └── ExportProgressOverlay.vue
│   ├── composables/
│   │   ├── useTable.ts               # Core table state management
│   │   ├── useFilters.ts             # Filter state
│   │   ├── useActions.ts             # Action handling + selection
│   │   ├── useExport.ts              # Export trigger + SSE progress
│   │   └── useStickyTable.ts         # Sticky header/columns
│   ├── types/
│   │   ├── table.ts
│   │   ├── column.ts
│   │   ├── filter.ts
│   │   ├── action.ts
│   │   └── pagination.ts
│   └── utils/
│       ├── url-helpers.ts
│       └── icon-resolver.ts
└── migrations/
    ├── create-table-views.ts
    └── create-export-jobs.ts
```

## Table Definition API

```typescript
@TableConfig({
  resource: UserEntity,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
  perPageOptions: [15, 30, 50, 100],
  softDeletes: true,
  searchable: ['name', 'email'],
  stickyHeader: true,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable().searchable(),
      BadgeColumn.make('status')
        .variants({ active: 'success', inactive: 'destructive' }),
      DateTimeColumn.make('createdAt').sortable(),
      ActionColumn.make(),
    ];
  }

  filters() {
    return [
      TextFilter.make('name'),
      TextFilter.make('email'),
      SetFilter.make('role').options([
        { value: '1', label: 'Admin' },
        { value: '2', label: 'User' },
      ]),
      DateFilter.make('createdAt'),
      BooleanFilter.make('isActive'),
    ];
  }

  actions() {
    return [
      Action.make('edit').asLink().url((row) => `/users/${row.id}/edit`),
      Action.make('delete')
        .asButton()
        .variant(Variant.Destructive)
        .confirm({ title: 'Delete user?', message: 'This cannot be undone.' })
        .handle(async (row, repo) => repo.softDelete(row.id)),
      Action.make('bulkDelete')
        .bulk()
        .variant(Variant.Destructive)
        .confirm({ title: 'Delete selected?' })
        .handle(async (ids, repo) => repo.softDelete(ids)),
    ];
  }

  exports() {
    return [
      Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx),
      Export.make('CSV', 'users.csv', ExportFormat.Csv),
    ];
  }

  emptyState() {
    return EmptyState.make()
      .title('No users found')
      .message('Try adjusting your filters or create a new user')
      .action({ label: 'Create User', url: '/users/create' })
      .icon('users');
  }
}
```

## Controller Integration

```typescript
@Controller('users')
export class UsersController {
  constructor(
    private tableQuery: TableQueryService,
    private usersTable: UsersTable,
  ) {}

  @Get()
  async findAll(@Query() query: TableQueryDto) {
    return this.tableQuery.execute(this.usersTable, query);
  }
}
```

## Request Format

```
GET /api/users?page=1&limit=15&sort=name:asc&search=john&filters[email][contains]=gmail&filters[createdAt][between]=2025-01-01,2025-12-31
```

### TableQueryDto

```typescript
export class TableQueryDto {
  page?: number = 1;           // min 1
  limit?: number = 15;         // min 1, max 100
  sort?: string;               // "column:asc" or "column:desc"
  search?: string;             // global search term
  filters?: Record<string, Record<string, string>>;  // { column: { clause: value } }
  columns?: string;            // visible columns: "name,email,status"
}
```

## Response Contract

```json
{
  "meta": {
    "columns": [
      {
        "key": "name",
        "label": "Name",
        "type": "text",
        "sortable": true,
        "searchable": true,
        "toggleable": true,
        "visible": true,
        "alignment": "left"
      },
      {
        "key": "status",
        "label": "Status",
        "type": "badge",
        "sortable": false,
        "variants": { "active": "success", "inactive": "destructive" }
      }
    ],
    "filters": [
      {
        "key": "name",
        "label": "Name",
        "type": "text",
        "clauses": ["contains", "equals", "startsWith", "endsWith", "notContains"]
      },
      {
        "key": "role",
        "label": "Role",
        "type": "set",
        "clauses": ["in", "notIn"],
        "options": [{ "value": "1", "label": "Admin" }]
      }
    ],
    "actions": {
      "row": [
        {
          "name": "edit",
          "label": "Edit",
          "type": "link",
          "variant": "default",
          "icon": "pencil"
        }
      ],
      "bulk": [
        {
          "name": "bulkDelete",
          "label": "Delete selected",
          "variant": "destructive",
          "confirm": { "title": "Delete selected?" }
        }
      ]
    },
    "exports": [
      { "name": "Excel", "fileName": "users.xlsx", "format": "xlsx" }
    ],
    "search": { "enabled": true, "placeholder": "Search by name, email..." },
    "perPageOptions": [15, 30, 50, 100],
    "softDeletes": true,
    "stickyHeader": true
  },
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "createdAt": "2025-03-15T10:00:00Z"
    }
  ],
  "pagination": {
    "type": "full",
    "currentPage": 1,
    "lastPage": 16,
    "perPage": 15,
    "total": 230,
    "from": 1,
    "to": 15
  }
}
```

## Query Building

`TableQueryService.execute()` pipeline:

1. Get TypeORM repository from table's resource entity
2. Create `SelectQueryBuilder`
3. Apply global search → `WHERE (col1 ILIKE '%term%' OR col2 ILIKE '%term%')`
4. Apply filters → each Filter class validates clause and appends `WHERE` conditions
5. Apply sort → `ORDER BY column direction`
6. Apply relations → `leftJoinAndSelect` for relation-based columns/filters
7. Apply soft delete scope → `WHERE deletedAt IS NULL` (unless TrashedFilter overrides)
8. Paginate → `.skip().take()` for full, cursor logic for cursor
9. Return `{ meta, data, pagination }`

### Filter Clause Mapping (24 clauses)

| Clause | SQL |
|--------|-----|
| `contains` | `ILIKE '%value%'` |
| `notContains` | `NOT ILIKE '%value%'` |
| `equals` | `= value` |
| `notEquals` | `!= value` |
| `startsWith` | `ILIKE 'value%'` |
| `endsWith` | `ILIKE '%value'` |
| `notStartsWith` | `NOT ILIKE 'value%'` |
| `notEndsWith` | `NOT ILIKE '%value'` |
| `greaterThan` | `> value` |
| `greaterThanOrEqual` | `>= value` |
| `lessThan` | `< value` |
| `lessThanOrEqual` | `<= value` |
| `between` | `BETWEEN value1 AND value2` |
| `notBetween` | `NOT BETWEEN value1 AND value2` |
| `before` | `< value` |
| `equalOrBefore` | `<= value` |
| `after` | `> value` |
| `equalOrAfter` | `>= value` |
| `in` | `IN (values)` |
| `notIn` | `NOT IN (values)` |
| `isTrue` | `= true` |
| `isFalse` | `= false` |
| `isSet` | `IS NOT NULL` |
| `isNotSet` | `IS NULL` |

Soft delete clauses (`withTrashed`, `onlyTrashed`, `withoutTrashed`) modify the base query scope.

All queries use parameterized values — no SQL injection risk.

## Actions

```
POST /table/action/:tableClass/:actionName
Body: { id: 1 }        ← row action
Body: { ids: [1,2,3] } ← bulk action
```

- Table classes registered in `TableRegistry` (map of string → BaseTable instance)
- Authorization via `.authorize(callback)` on action builder
- Execution: before() → handle() → after() hooks
- Response: success message, redirect URL, or file download

## Exports (Async + SSE)

```
POST /table/export/:tableClass/:exportName  → returns { jobId }
GET  /table/export/stream/:jobId            → SSE stream
GET  /table/export/download/:jobId          → file download
```

### ExportJob Entity

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tableClass | string | Table identifier |
| exportName | string | Export name |
| fileName | string | Output file name |
| format | enum | xlsx, csv, pdf |
| queryState | json | Frozen filters/sort state |
| selectedIds | string | For selected-only exports |
| status | string | pending, processing, completed, failed |
| progress | number | 0-100 |
| filePath | string | Output file location |
| userId | number | Owner |
| createdAt | timestamp | Created date |

### SSE Events

```
{ status: 'processing', progress: 45 }
{ status: 'completed', downloadUrl: '/table/export/download/abc' }
{ status: 'failed', error: 'Something went wrong' }
```

Libraries: ExcelJS (xlsx, csv), PDFKit (pdf).

## Saved Views

```
POST   /table/views/:tableClass       → store view
GET    /table/views/:tableClass       → list user's views
DELETE /table/views/:tableClass/:id   → delete view
```

### TableView Entity

| Column | Type | Description |
|--------|------|-------------|
| id | number | Primary key |
| userId | number | Owner (nullable for shared views) |
| tableClass | string | Table identifier |
| tableName | string | Custom name (nullable) |
| title | string | View title |
| requestPayload | json | Frozen filter/sort/column state |
| createdAt | timestamp | Created date |
| updatedAt | timestamp | Updated date |

## Soft Deletes

When `softDeletes: true` in `@TableConfig`:
- Auto-adds `TrashedFilter` (withTrashed, onlyTrashed, withoutTrashed)
- Scopes queries to `WHERE deletedAt IS NULL` by default
- Auto-adds `restore` and `forceDelete` row actions when viewing trashed items
- Authorization via `canRestore()` / `canForceDelete()` overrides

## Frontend — Vue Composables

```typescript
// useTable — core state
const { data, columns, filters, actions, exports, views,
  pagination, isLoading, isEmpty,
  setPage, setPerPage, setSort, setSearch,
  addFilter, removeFilter, updateFilter,
  toggleColumn, refresh } = useTable('/api/users');

// useFilters — filter management
const { activeFilters, addFilter, removeFilter, updateClause, updateValue } = useFilters();

// useActions — selection + execution
const { selectedIds, selectAll, executeAction, confirmDialog } = useActions(config);

// useExport — SSE-driven export progress
const { triggerExport, exportProgress, isExporting } = useExport();

// useStickyTable — scroll tracking
const { tableRef, headerStuck, stickyStyles } = useStickyTable();
```

All state synced to URL query string via vue-router. Debounced at 300ms (configurable).

## Additional Features

- **Empty states:** Configurable title, message, CTA button, icon
- **Sticky header/columns:** IntersectionObserver + CSS position: sticky
- **Column features:** sortable, searchable, toggleable, alignment, mapAs, truncate, wrap, classes, exportAs, hidden
- **Image column:** size (sm/md/lg), fallback, rounded, position
- **Scroll position:** TopOfPage (default), MiddleOfPage, BottomOfPage, NoScroll
- **Debouncing:** 300ms default, configurable per table
- **URL sync:** All filter/sort/page state reflected in browser URL
