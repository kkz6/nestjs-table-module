# Saved Views

Saved views allow users to persist their current table state (filters, sorting, column visibility) and recall it later. Each view is scoped to a user and a table class.

## Overview

A saved view captures the full request payload -- filters, sort order, search term, visible columns, and per-page setting -- as a JSON object. Users can save named views like "Active Users" or "Recent Orders" and switch between them with a single click.

## TableView Entity

Views are stored in the `table_views` database table using a TypeORM entity:

```typescript
@Entity('table_views')
export class TableViewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column()
  tableClass: string;

  @Column({ nullable: true })
  tableName: string;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  requestPayload: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

| Field            | Type     | Description                                              |
|------------------|----------|----------------------------------------------------------|
| `id`             | number   | Auto-generated primary key                               |
| `userId`         | number   | The ID of the user who created the view                  |
| `tableClass`     | string   | The registry name of the table (e.g., `"UsersTable"`)    |
| `tableName`      | string   | Optional human-readable table name                       |
| `title`          | string   | The user-given name for this view                        |
| `requestPayload` | jsonb    | The saved table state as a JSON object                   |
| `createdAt`      | Date     | When the view was created                                |
| `updatedAt`      | Date     | When the view was last updated                           |

### Database Migration

You need to create a migration for the `table_views` table. The `requestPayload` column requires the `jsonb` type (PostgreSQL) or `json` type (MySQL).

## REST Endpoints

All view endpoints are scoped under `table/views` and require JWT authentication.

### List Views

```
GET /table/views/:tableClass
```

Returns all views for the authenticated user and the given table class, ordered by most recently created.

**Response:**

```json
[
  {
    "id": 1,
    "userId": 42,
    "tableClass": "UsersTable",
    "title": "Active Users",
    "requestPayload": {
      "filters": { "status": { "in": "active" } },
      "sort": "name:asc",
      "limit": 30
    },
    "createdAt": "2026-03-15T10:30:00Z",
    "updatedAt": "2026-03-15T10:30:00Z"
  }
]
```

### Store View

```
POST /table/views/:tableClass
```

Creates a new saved view.

**Request Body:**

```json
{
  "title": "Active Users",
  "requestPayload": {
    "filters": { "status": { "in": "active" } },
    "sort": "name:asc",
    "search": "",
    "limit": 30,
    "columns": "name,email,status"
  }
}
```

| Field            | Type   | Required | Description                            |
|------------------|--------|----------|----------------------------------------|
| `title`          | string | Yes      | Name for the view                      |
| `requestPayload` | object | Yes      | The table state to persist             |

**Response:** The created `TableViewEntity` object.

### Delete View

```
DELETE /table/views/:tableClass/:id
```

Deletes a saved view. Only the view owner can delete it.

**Response:**

```json
{
  "success": true
}
```

## How Views Store State

The `requestPayload` JSON object captures the complete table query state. A typical payload looks like:

```json
{
  "page": 1,
  "limit": 30,
  "sort": "createdAt:desc",
  "search": "john",
  "filters": {
    "status": { "in": "active" },
    "createdAt": { "after": "2026-01-01" }
  },
  "columns": "name,email,status,createdAt"
}
```

When a view is loaded on the frontend, the `requestPayload` is used to reconstruct the table state -- setting filters, sort, search, columns, and per-page values.

## Per-User Scoping

Views are scoped to the authenticated user via the `userId` column. The `TableViewService` methods always filter by `userId`:

```typescript
async findByUser(tableClass: string, userId: number) {
  return this.viewRepo.find({
    where: { tableClass, userId },
    order: { createdAt: 'DESC' },
  });
}
```

The user ID is extracted from the JWT token in the request (`req.user.id`).

## Frontend ViewsDropdown Component

The table meta response includes a `views` array. On the frontend, a `ViewsDropdown` component (or similar) displays the user's saved views and allows selecting or deleting them.

### Loading a View

When a user selects a saved view, the frontend should:

1. Read the `requestPayload` from the selected view.
2. Apply the saved state to the `useTable` composable (set filters, sort, search, etc.).
3. Trigger a data fetch.

### Saving a View

When a user clicks "Save View":

1. Capture the current table state from the `useTable` composable.
2. Prompt the user for a view name.
3. POST to `/table/views/:tableClass` with the title and the current query state as `requestPayload`.
4. Add the returned view to the local views list.

## Example: Saving an "Active Users" View

### Backend

No special backend configuration is needed beyond importing the `TableModule`, which registers the view controller and service.

### Frontend Workflow

```typescript
// 1. User configures the table
//    - Sets status filter to "active"
//    - Sorts by name ascending
//    - Sets per-page to 30

// 2. User clicks "Save View" and enters "Active Users"

// 3. Frontend sends:
const response = await fetch('/table/views/UsersTable', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Active Users',
    requestPayload: {
      filters: { status: { in: 'active' } },
      sort: 'name:asc',
      limit: 30,
    },
  }),
});

// 4. View is saved. Later, user selects "Active Users" from dropdown.
// 5. Frontend applies the requestPayload to the table state.
```

## Views in Table Meta

The `TableMeta` response includes a `views` array. However, views are loaded dynamically -- the `BaseTable.toMeta()` method returns an empty array by default. The actual views are fetched separately via the `GET /table/views/:tableClass` endpoint, since they are user-specific.

```json
{
  "meta": {
    "views": [],
    "columns": [...],
    "filters": [...]
  }
}
```
