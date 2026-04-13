# API Reference

Complete REST API reference for the NestJS Table Module. All endpoints except the table data endpoint are prefixed with `/table` and require JWT authentication.

---

## Table Data

### `GET /api/:resource`

The main table endpoint. This is defined by your NestJS controller, not by the table module itself. You call `TableQueryService.execute()` to process the request.

### Query Parameters

| Parameter  | Type   | Default | Description                                          |
|------------|--------|---------|------------------------------------------------------|
| `page`     | number | `1`     | Page number (1-based)                                |
| `limit`    | number | `15`    | Items per page (1-100)                               |
| `sort`     | string | -       | Sort specification in `column:direction` format      |
| `search`   | string | -       | Global search term                                   |
| `filters`  | object | -       | Filter specifications (see below)                    |
| `columns`  | string | -       | Comma-separated list of visible column keys          |

### Filter Query Format

Filters are passed as nested query parameters:

```
?filters[status][in]=active&filters[createdAt][after]=2026-01-01
```

This is parsed into:

```json
{
  "status": { "in": "active" },
  "createdAt": { "after": "2026-01-01" }
}
```

### Example Request

```
GET /api/users?page=2&limit=30&sort=createdAt:desc&search=john&filters[status][in]=active
```

### Example Response

```json
{
  "meta": {
    "columns": [
      {
        "type": "text",
        "key": "name",
        "header": "Name",
        "sortable": true,
        "searchable": true,
        "toggleable": true,
        "visible": true,
        "alignment": "left",
        "wrap": false,
        "truncate": false,
        "headerClass": null,
        "cellClass": null,
        "stickable": false,
        "meta": null
      },
      {
        "type": "text",
        "key": "email",
        "header": "Email",
        "sortable": true,
        "searchable": true,
        "toggleable": true,
        "visible": true,
        "alignment": "left",
        "wrap": false,
        "truncate": false,
        "headerClass": null,
        "cellClass": null,
        "stickable": false,
        "meta": null
      },
      {
        "type": "badge",
        "key": "status",
        "header": "Status",
        "sortable": false,
        "searchable": false,
        "toggleable": true,
        "visible": true,
        "alignment": "left",
        "wrap": false,
        "truncate": false,
        "headerClass": null,
        "cellClass": null,
        "stickable": false,
        "meta": null,
        "variants": {
          "active": "success",
          "inactive": "destructive",
          "pending": "warning"
        }
      },
      {
        "type": "datetime",
        "key": "createdAt",
        "header": "Created at",
        "sortable": true,
        "searchable": false,
        "toggleable": true,
        "visible": true,
        "alignment": "left",
        "wrap": false,
        "truncate": false,
        "headerClass": null,
        "cellClass": null,
        "stickable": false,
        "meta": null
      },
      {
        "type": "action",
        "key": "_actions",
        "header": "",
        "sortable": false,
        "searchable": false,
        "toggleable": false,
        "visible": true,
        "alignment": "right",
        "wrap": false,
        "truncate": false,
        "headerClass": null,
        "cellClass": null,
        "stickable": false,
        "meta": null,
        "asDropdown": true
      }
    ],
    "filters": [
      {
        "key": "name",
        "label": "Name",
        "type": "text",
        "clauses": ["contains", "not_contains", "equals", "not_equals", "starts_with", "ends_with"],
        "default": null
      },
      {
        "key": "status",
        "label": "Status",
        "type": "set",
        "clauses": ["in", "not_in"],
        "options": [
          { "value": "active", "label": "Active" },
          { "value": "inactive", "label": "Inactive" },
          { "value": "pending", "label": "Pending" }
        ],
        "default": null
      },
      {
        "key": "trashed",
        "label": "Trashed",
        "type": "set",
        "clauses": [],
        "options": [
          { "value": "without_trashed", "label": "Without trashed" },
          { "value": "with_trashed", "label": "With trashed" },
          { "value": "only_trashed", "label": "Only trashed" }
        ],
        "default": null
      }
    ],
    "actions": {
      "row": [
        {
          "name": "edit",
          "label": "Edit",
          "type": "link",
          "variant": "default",
          "icon": "pencil",
          "confirm": null,
          "download": false,
          "meta": null,
          "dataAttributes": null
        },
        {
          "name": "delete",
          "label": "Delete",
          "type": "button",
          "variant": "destructive",
          "icon": "trash",
          "confirm": {
            "title": "Delete user?",
            "message": "This action cannot be undone. The user will be moved to trash.",
            "confirmLabel": "Delete",
            "cancelLabel": "Cancel"
          },
          "download": false,
          "meta": null,
          "dataAttributes": null
        },
        {
          "name": "restore",
          "label": "Restore",
          "type": "button",
          "variant": "success",
          "icon": null,
          "confirm": {
            "title": "Restore this item?",
            "message": "This will restore the item from trash."
          },
          "download": false,
          "meta": null,
          "dataAttributes": null
        },
        {
          "name": "forceDelete",
          "label": "Force Delete",
          "type": "button",
          "variant": "destructive",
          "icon": null,
          "confirm": {
            "title": "Permanently delete?",
            "message": "This action cannot be undone."
          },
          "download": false,
          "meta": null,
          "dataAttributes": null
        }
      ],
      "bulk": [
        {
          "name": "bulkDelete",
          "label": "Delete Selected",
          "type": "button",
          "variant": "destructive",
          "icon": null,
          "confirm": {
            "title": "Delete selected users?"
          },
          "download": false,
          "meta": null,
          "dataAttributes": null
        }
      ]
    },
    "exports": [
      { "name": "Excel", "label": "Excel", "fileName": "users.xlsx", "format": "xlsx" },
      { "name": "CSV", "label": "CSV", "fileName": "users.csv", "format": "csv" },
      { "name": "PDF", "label": "PDF", "fileName": "users.pdf", "format": "pdf" }
    ],
    "search": {
      "enabled": true,
      "placeholder": "Search by name, email..."
    },
    "perPageOptions": [15, 30, 50, 100],
    "softDeletes": true,
    "stickyHeader": true,
    "debounce": 300,
    "scrollPosition": "topOfPage",
    "views": [],
    "emptyState": {
      "title": "No users found",
      "message": "Try adjusting your search or filter criteria, or create a new user.",
      "icon": "users",
      "action": {
        "label": "Create User",
        "url": "/users/create"
      }
    }
  },
  "data": [
    {
      "id": 16,
      "name": "John Doe",
      "email": "john@example.com",
      "status": { "value": "active", "variant": "success" },
      "isActive": true,
      "createdAt": "2026-03-15 14:30",
      "_actions": [
        {
          "name": "edit",
          "label": "Edit",
          "type": "link",
          "variant": "default",
          "icon": "pencil",
          "url": "/users/16/edit",
          "disabled": false,
          "hidden": false
        },
        {
          "name": "delete",
          "label": "Delete",
          "type": "button",
          "variant": "destructive",
          "icon": "trash",
          "confirm": {
            "title": "Delete user?",
            "message": "This action cannot be undone."
          },
          "url": null,
          "disabled": false,
          "hidden": false
        }
      ]
    }
  ],
  "pagination": {
    "type": "full",
    "currentPage": 2,
    "lastPage": 5,
    "perPage": 30,
    "total": 147,
    "from": 31,
    "to": 60
  }
}
```

---

## Actions

### `POST /table/action/:tableClass/:actionName`

Execute a row or bulk action.

### Path Parameters

| Parameter    | Type   | Description                            |
|--------------|--------|----------------------------------------|
| `tableClass` | string | The registered table class name        |
| `actionName` | string | The action name (e.g., `delete`)       |

### Request Body

For row actions:

```json
{
  "id": "42"
}
```

For bulk actions:

```json
{
  "ids": ["1", "2", "3"]
}
```

### Request Body DTO

```typescript
class ActionRequestDto {
  id?: string;    // Single row ID
  ids?: string[]; // Multiple row IDs for bulk actions
}
```

### Success Response

Returns the handler's return value, or `{ success: true }` if the handler returns nothing:

```json
{
  "success": true
}
```

Or with a custom message from the handler:

```json
{
  "message": "User deleted successfully"
}
```

### Error Responses

| Status | Condition                              | Response                                      |
|--------|----------------------------------------|-----------------------------------------------|
| 404    | Table class not found in registry      | `{ "message": "Table UsersTable not found" }` |
| 404    | Action name not found on the table     | `{ "message": "Action delete not found" }`    |
| 401    | Missing or invalid JWT token           | `{ "message": "Unauthorized" }`               |

---

## Exports

### `POST /table/export/:tableClass/:exportName`

Trigger an export job. Creates an `ExportJobEntity` and begins processing asynchronously.

### Path Parameters

| Parameter    | Type   | Description                          |
|--------------|--------|--------------------------------------|
| `tableClass` | string | The registered table class name      |
| `exportName` | string | The export name (e.g., `Excel`)      |

### Query Parameters

Accepts the same `TableQueryDto` parameters as the main table endpoint to filter the exported data.

### Response

```json
{
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Error Responses

| Status | Condition                         | Response                                      |
|--------|-----------------------------------|-----------------------------------------------|
| 404    | Table class not found             | `{ "message": "Table UsersTable not found" }` |
| 401    | Missing or invalid JWT token      | `{ "message": "Unauthorized" }`               |

---

### `GET /table/export/stream/:jobId` (SSE)

Server-Sent Events stream for export progress.

### Path Parameters

| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| `jobId`   | string | The export job UUID      |

### SSE Event Format

Each event is a JSON object in the `data` field:

**Processing:**

```
data: {"status":"processing","progress":50}
```

**Completed:**

```
data: {"status":"completed","progress":100,"downloadUrl":"/table/export/download/a1b2c3d4-e5f6-7890-abcd-ef1234567890"}
```

**Failed:**

```
data: {"status":"failed","progress":0,"error":"Export generation failed"}
```

### SSE Event Fields

| Field         | Type          | Description                                        |
|---------------|---------------|----------------------------------------------------|
| `status`      | string        | `"processing"`, `"completed"`, or `"failed"`       |
| `progress`    | number        | Progress percentage (0-100)                        |
| `downloadUrl` | string\|null  | Present only when status is `"completed"`          |
| `error`       | string\|null  | Present only when status is `"failed"`             |

---

### `GET /table/export/download/:jobId`

Download the generated export file.

### Path Parameters

| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| `jobId`   | string | The export job UUID      |

### Response

The file is sent as a download attachment with the original file name (e.g., `users.xlsx`).

### Error Responses

| Status | Condition                                         | Response                               |
|--------|---------------------------------------------------|----------------------------------------|
| 404    | Job not found or status is not `"completed"`      | `{ "message": "Export not ready" }`    |

---

## Views

All view endpoints require JWT authentication. Views are scoped to the authenticated user.

### `GET /table/views/:tableClass`

List all saved views for the current user and table class.

### Path Parameters

| Parameter    | Type   | Description                        |
|--------------|--------|------------------------------------|
| `tableClass` | string | The registered table class name    |

### Response

```json
[
  {
    "id": 1,
    "userId": 42,
    "tableClass": "UsersTable",
    "tableName": null,
    "title": "Active Users",
    "requestPayload": {
      "filters": { "status": { "in": "active" } },
      "sort": "name:asc",
      "limit": 30
    },
    "createdAt": "2026-03-15T10:30:00.000Z",
    "updatedAt": "2026-03-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "userId": 42,
    "tableClass": "UsersTable",
    "tableName": null,
    "title": "Recent Signups",
    "requestPayload": {
      "sort": "createdAt:desc",
      "limit": 50
    },
    "createdAt": "2026-03-10T08:15:00.000Z",
    "updatedAt": "2026-03-10T08:15:00.000Z"
  }
]
```

---

### `POST /table/views/:tableClass`

Create a new saved view.

### Path Parameters

| Parameter    | Type   | Description                        |
|--------------|--------|------------------------------------|
| `tableClass` | string | The registered table class name    |

### Request Body

```json
{
  "title": "Active Users",
  "requestPayload": {
    "filters": { "status": { "in": "active" } },
    "sort": "name:asc",
    "limit": 30
  }
}
```

### Request Body DTO

```typescript
class StoreViewDto {
  title: string;                        // Required, non-empty
  requestPayload: Record<string, any>;  // Required, must be object
}
```

### Response

Returns the created entity:

```json
{
  "id": 3,
  "userId": 42,
  "tableClass": "UsersTable",
  "tableName": null,
  "title": "Active Users",
  "requestPayload": {
    "filters": { "status": { "in": "active" } },
    "sort": "name:asc",
    "limit": 30
  },
  "createdAt": "2026-04-13T12:00:00.000Z",
  "updatedAt": "2026-04-13T12:00:00.000Z"
}
```

---

### `DELETE /table/views/:tableClass/:id`

Delete a saved view. Only the view's owner can delete it.

### Path Parameters

| Parameter    | Type   | Description                        |
|--------------|--------|------------------------------------|
| `tableClass` | string | The registered table class name    |
| `id`         | number | The view ID                        |

### Response

```json
{
  "success": true
}
```

---

## Response Contract

### TableResponse

The top-level response returned by `TableQueryService.execute()`:

```typescript
interface TableResponse<T = any> {
  meta: TableMeta;
  data: T[];
  pagination: PaginationData;
}
```

### TableMeta

```typescript
interface TableMeta {
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
```

### PaginationData

```typescript
interface PaginationData {
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
```

### Data Item

Each item in the `data` array includes the entity fields mapped through column formatters, plus a `_actions` array for row actions:

```typescript
{
  id: number;
  [columnKey: string]: any;
  _actions?: Array<{
    name: string;
    label: string;
    type: 'button' | 'link';
    variant: string;
    icon?: string | null;
    confirm?: ActionConfirm | null;
    url: string | null;
    disabled: boolean;
    hidden: boolean;
    download: boolean;
    meta?: Record<string, any> | null;
    dataAttributes?: Record<string, string> | null;
  }>;
}
```
