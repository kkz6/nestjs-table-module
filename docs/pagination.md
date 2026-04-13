# Pagination

The table module supports three pagination strategies, each suited to different use cases. The pagination type is configured on the backend via `@TableConfig` and the frontend renders the appropriate UI automatically.

## Configuration

Set the pagination type in your table class decorator:

```typescript
import { PaginationType, SortDirection } from '@nestjs-table-module/backend';

@TableConfig({
  resource: UserEntity,
  pagination: PaginationType.Full,     // default
  perPageOptions: [15, 30, 50, 100],   // default
  defaultPerPage: 15,                  // default
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
})
export class UsersTable extends BaseTable<UserEntity> {
  // ...
}
```

---

## PaginationType.Full (default)

Traditional page-number pagination with a total count. The server executes a `COUNT(*)` query alongside the data query to determine the total number of records.

### Response Shape

```json
{
  "pagination": {
    "type": "full",
    "currentPage": 2,
    "lastPage": 10,
    "perPage": 15,
    "total": 147,
    "from": 16,
    "to": 30
  }
}
```

| Field         | Type   | Description                                    |
|---------------|--------|------------------------------------------------|
| `type`        | string | Always `"full"`                                |
| `currentPage` | number | The current page number (1-based)              |
| `lastPage`    | number | Total number of pages                          |
| `perPage`     | number | Items per page                                 |
| `total`       | number | Total number of matching records               |
| `from`        | number | 1-based index of the first item on this page   |
| `to`          | number | 1-based index of the last item on this page    |

### How It Works

The `TableQueryService` runs two queries:

1. `qb.getCount()` to get the total matching records.
2. `qb.skip((page - 1) * perPage).take(perPage).getMany()` to fetch the page data.

`lastPage` is computed as `Math.ceil(total / perPage)`.

### Frontend Rendering

The `TablePagination` component renders numbered page buttons with ellipsis logic:

- If `lastPage <= 7`: all page numbers are shown.
- If `lastPage > 7`: the component shows page 1, an ellipsis if needed, a window of pages around `currentPage`, another ellipsis if needed, and the last page.
- Prev and Next buttons are always shown, disabled at the boundaries.
- The "Showing X to Y of Z" label is displayed.

### Example Request

```
GET /api/users?page=2&limit=15&sort=createdAt:desc
```

---

## PaginationType.Simple

Previous/Next-only pagination without a total count. This is faster for large datasets because it skips the `COUNT(*)` query entirely.

### Configuration

```typescript
@TableConfig({
  resource: OrderEntity,
  pagination: PaginationType.Simple,
})
export class OrdersTable extends BaseTable<OrderEntity> {
  // ...
}
```

### Response Shape

```json
{
  "pagination": {
    "type": "simple",
    "currentPage": 3,
    "lastPage": 0,
    "perPage": 15,
    "total": 0,
    "from": 31,
    "to": 45
  }
}
```

The `total` and `lastPage` fields are still present (for interface compatibility) but their values are not meaningful -- `total` is the count from the underlying query, and `lastPage` is computed from it. The frontend renders only Previous/Next buttons, never page numbers.

### Frontend Rendering

The `TablePagination` component detects `type !== 'full'` and renders two buttons:

- **Previous**: disabled when `currentPage <= 1`.
- **Next**: disabled when `currentPage >= lastPage`.

The per-page selector is still shown. The "Showing X to Y" text does not display a total.

### When to Use

- Tables with hundreds of thousands or millions of rows.
- When exact total counts are not needed.
- Reporting dashboards where users navigate sequentially.

---

## PaginationType.Cursor

Cursor-based pagination that fetches `perPage + 1` records to detect whether more data exists. Ideal for real-time feeds and infinite scroll interfaces.

### Configuration

```typescript
@TableConfig({
  resource: ActivityEntity,
  pagination: PaginationType.Cursor,
})
export class ActivitiesTable extends BaseTable<ActivityEntity> {
  // ...
}
```

### Response Shape

```json
{
  "pagination": {
    "type": "cursor",
    "currentPage": 1,
    "lastPage": 0,
    "perPage": 15,
    "total": 0,
    "from": 0,
    "to": 15,
    "nextCursor": "next",
    "previousCursor": null
  }
}
```

| Field            | Type          | Description                                         |
|------------------|---------------|-----------------------------------------------------|
| `nextCursor`     | string\|null  | Non-null if there are more records after this page   |
| `previousCursor` | string\|null  | Non-null if there are records before this page       |

### How It Works

The `TableQueryService` fetches `perPage + 1` records using `qb.take(perPage + 1).getMany()`. If the returned array has more items than `perPage`, there is a next page -- the extra item is popped off and `nextCursor` is set. No `COUNT(*)` is executed.

### Frontend Rendering

The component renders Previous/Next buttons only:

- **Previous**: disabled when `currentPage <= 1`.
- **Next**: disabled when `nextCursor` is null.

### When to Use

- Real-time data feeds (activity logs, notifications).
- Infinite scroll UIs.
- Very large datasets where `COUNT(*)` is prohibitively expensive.
- When records may be inserted/deleted between page loads (cursor avoids skipped/duplicate rows).

---

## Per-Page Options

The `perPageOptions` setting controls which values appear in the per-page dropdown. The default is `[15, 30, 50, 100]`.

```typescript
@TableConfig({
  resource: UserEntity,
  perPageOptions: [10, 25, 50],
})
```

The per-page dropdown is always rendered alongside the pagination controls and allows the user to change how many rows are shown per page.

## Default Per Page

The `defaultPerPage` option sets the initial number of rows displayed. The default is `15`. This value must be one of the `perPageOptions` values.

```typescript
@TableConfig({
  resource: UserEntity,
  defaultPerPage: 30,
  perPageOptions: [15, 30, 50, 100],
})
```

On the frontend, the `DataTable` component also accepts a `defaultPerPage` prop that can override the backend default:

```vue
<DataTable
  endpoint="/api/users"
  :default-per-page="30"
/>
```

## Frontend TablePagination Component

The `TablePagination` component receives the `pagination` object and `perPageOptions` array from the backend response (via `TableMeta`) and renders the correct UI based on the pagination type.

```vue
<TablePagination
  :pagination="pagination"
  :per-page-options="meta.perPageOptions"
  @page="setPage"
  @per-page="setPerPage"
/>
```

| Event     | Payload       | Description                        |
|-----------|---------------|------------------------------------|
| `page`    | `number`      | Emitted when a page is selected    |
| `perPage` | `number`      | Emitted when per-page is changed   |

The component is fully controlled -- the parent (`DataTable` or your custom wrapper) handles state changes and re-fetches data.

## URL Synchronization

When `syncUrl` is enabled (the default), pagination state is synced to the URL as query parameters:

```
/users?page=2&limit=30
```

On page load, the `useTable` composable reads these parameters from the URL and initializes accordingly. This means users can bookmark or share paginated views.
