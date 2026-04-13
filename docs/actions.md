# Actions

Actions represent operations that can be performed on table rows (row actions) or on a selection of rows (bulk actions). They support confirmation dialogs, authorization, conditional visibility, URL resolution, lifecycle hooks, and rich styling.

Actions are defined in your table class by overriding the `actions()` method.

```ts
import { Action, Variant } from '@nestjs-table-module/backend';

class UsersTable extends BaseTable<User> {
  actions() {
    return [
      Action.make('edit', 'Edit')
        .asLink()
        .icon('pencil')
        .url((row) => `/users/${row.id}/edit`),

      Action.make('delete', 'Delete')
        .asButton()
        .variant(Variant.Destructive)
        .confirm({ title: 'Delete user?' })
        .handle(async (item, repo) => {
          await repo.softDelete(item.id);
        }),

      Action.make('bulkDelete', 'Delete Selected')
        .bulk()
        .variant(Variant.Destructive)
        .confirm({ title: 'Delete selected users?' })
        .handle(async (ids, repo) => {
          await repo.softDelete(ids);
        }),
    ];
  }
}
```

---

## Table of Contents

- [Factory](#factory)
- [Type Methods](#type-methods)
- [Styling](#styling)
- [Confirmation](#confirmation)
- [Authorization](#authorization)
- [Visibility](#visibility)
- [URL Resolution](#url-resolution)
- [Handlers & Lifecycle](#handlers--lifecycle)
- [Bulk Actions](#bulk-actions)
- [Data Attributes & Meta](#data-attributes--meta)
- [Download](#download)
- [Getter Methods](#getter-methods)
- [Serialization](#serialization)
- [Row Actions vs Bulk Actions](#row-actions-vs-bulk-actions)
- [Soft Delete Auto-Actions](#soft-delete-auto-actions)
- [Frontend Integration](#frontend-integration)
- [Complete Example](#complete-example)

---

## Factory

```ts
static make(name: string, label?: string): Action
```

Creates a new action instance.

- `name` -- a unique identifier for this action, used in API routes and serialization.
- `label` -- the display text shown to the user. If omitted, the name is capitalized: `'edit'` becomes `'Edit'`, `'bulkDelete'` becomes `'BulkDelete'`.

```ts
Action.make('edit')          // label: 'Edit'
Action.make('edit', 'Edit User')  // label: 'Edit User'
```

---

## Type Methods

Actions have two types that determine how the frontend renders and executes them.

### `asButton(): this`

Sets the action type to `ActionType.Button` (the default). Button actions send a POST request to the backend when clicked.

### `asLink(): this`

Sets the action type to `ActionType.Link`. Link actions navigate the browser to a URL instead of making an API call. Must be paired with `url()`.

```ts
Action.make('view', 'View Details')
  .asLink()
  .url((row) => `/users/${row.id}`)
```

### ActionType Enum

| Value | String | Description |
|---|---|---|
| `ActionType.Button` | `'button'` | Triggers a server-side handler via POST |
| `ActionType.Link` | `'link'` | Navigates to a URL |

---

## Styling

### `variant(v: Variant): this`

Sets the visual style of the action button. The frontend maps these to CSS classes.

```ts
Action.make('delete').variant(Variant.Destructive)
```

### Variant Enum

| Value | String | Typical Use |
|---|---|---|
| `Variant.Default` | `'default'` | Standard actions |
| `Variant.Info` | `'info'` | Informational actions |
| `Variant.Success` | `'success'` | Positive actions (approve, restore) |
| `Variant.Warning` | `'warning'` | Cautionary actions |
| `Variant.Destructive` | `'destructive'` | Dangerous actions (delete, remove) |
| `Variant.Secondary` | `'secondary'` | Secondary/less prominent actions |
| `Variant.Outline` | `'outline'` | Outlined button style |
| `Variant.Ghost` | `'ghost'` | Minimal/ghost button style |
| `Variant.Link` | `'link'` | Styled as a text link |

### `icon(icon: string): this`

Sets an icon identifier for the action. The frontend icon resolver maps these to actual icon components.

```ts
Action.make('edit').icon('pencil')
Action.make('delete').icon('trash')
```

---

## Confirmation

### `confirm(config: ActionConfirm): this`

Adds a confirmation dialog that appears before the action is executed. The user must confirm or cancel before the action proceeds.

```ts
interface ActionConfirm {
  title: string;          // Required: dialog title
  message?: string;       // Optional: dialog body text
  confirmLabel?: string;  // Optional: confirm button text (default: "Confirm")
  cancelLabel?: string;   // Optional: cancel button text (default: "Cancel")
}
```

```ts
Action.make('delete', 'Delete')
  .confirm({
    title: 'Delete user?',
    message: 'This action cannot be undone. The user will be moved to trash.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
  })
```

**Frontend behavior:** When the user clicks an action with a confirm configuration, the `useActions` composable stores the pending action and shows a `ConfirmDialog` component. The action only executes after the user clicks the confirm button.

---

## Authorization

### `authorize(callback: (user: any) => boolean): this`

Sets an authorization gate for the action. If the callback returns `false`, the action is not available to the user. Authorization is checked server-side.

```ts
Action.make('delete')
  .authorize((user) => user.role === 'admin')
```

### `isAuthorized(user: any): boolean`

Returns `true` if the action is authorized for the given user. If no `authorize` callback is set, always returns `true`.

---

## Visibility

Visibility methods control whether an action is shown or enabled on a **per-row** basis. These are evaluated during serialization for each data row.

### `disabled(callback: (item: any) => boolean): this`

Conditionally disables the action for a specific row. A disabled action is visible but non-interactive.

```ts
Action.make('approve')
  .disabled((item) => item.status === 'approved')
```

### `hidden(callback: (item: any) => boolean): this`

Conditionally hides the action for a specific row. A hidden action is completely removed from the row's action list.

```ts
Action.make('restore')
  .hidden((item) => item.deletedAt === null)
```

### `isDisabledFor(item: any): boolean`

Returns `true` if the action should be disabled for the given item. Returns `false` if no `disabled` callback is set.

### `isHiddenFor(item: any): boolean`

Returns `true` if the action should be hidden for the given item. Returns `false` if no `hidden` callback is set.

**Note:** These per-row evaluations happen in `TableQueryService.transformItem()`, where each row's actions are serialized with resolved `disabled` and `hidden` values.

---

## URL Resolution

### `url(resolver: (item: any) => string): this`

Sets a dynamic URL resolver for link-type actions. The resolver receives the row item and should return a URL string.

```ts
Action.make('view')
  .asLink()
  .url((item) => `/users/${item.id}`)

Action.make('edit')
  .asLink()
  .url((item) => `/users/${item.id}/edit`)
```

### `resolveUrl(item: any): string | null`

Resolves the URL for a given item. Returns `null` if no `url` resolver is set.

**Serialization note:** URLs are resolved per-row during `TableQueryService.transformItem()`. The serialized action in each row's `_actions` array includes the resolved URL string.

---

## Handlers & Lifecycle

Actions have a three-phase lifecycle: **before** -> **handle** -> **after**.

### `handle(callback: (item: any, repo?: any) => Promise<any>): this`

Sets the main execution handler. For row actions, `item` is the entity; for bulk actions, `item` is the array of selected IDs.

```ts
Action.make('delete')
  .handle(async (item, repo) => {
    await repo.softDelete(item.id);
    return { message: 'User deleted successfully' };
  })
```

### `before(callback: (item: any) => Promise<void>): this`

Sets a pre-execution hook that runs before the main handler. Useful for logging, validation, or side effects.

```ts
Action.make('archive')
  .before(async (item) => {
    console.log(`Archiving item ${item.id}`);
  })
  .handle(async (item, repo) => {
    await repo.update(item.id, { archived: true });
  })
```

### `after(callback: (item: any, result: any) => Promise<void>): this`

Sets a post-execution hook that runs after the main handler. Receives the item and the result returned by `handle()`.

```ts
Action.make('approve')
  .handle(async (item, repo) => {
    await repo.update(item.id, { status: 'approved' });
    return { approved: true };
  })
  .after(async (item, result) => {
    // Send notification, log audit trail, etc.
    await notifyUser(item.userId, 'Your request was approved');
  })
```

### `execute(itemOrIds: any, repo?: any): Promise<any>`

Executes the full lifecycle. Called internally by `TableActionController`.

**Execution order:**

1. If `_beforeHandler` is set, calls `_beforeHandler(itemOrIds)`
2. If `_handler` is set, calls `_handler(itemOrIds, repo)` and stores the result
3. If `_afterHandler` is set, calls `_afterHandler(itemOrIds, result)`
4. Returns the result (or `undefined` if no handler)

---

## Bulk Actions

### `bulk(value?: boolean): this`

Marks the action as a bulk action. Bulk actions operate on multiple selected rows rather than a single row. Defaults to `true` when called without arguments.

```ts
Action.make('bulkDelete', 'Delete Selected')
  .bulk()
  .variant(Variant.Destructive)
  .confirm({ title: 'Delete selected users?' })
  .handle(async (ids: string[], repo) => {
    await repo.softDelete(ids);
    return { message: `${ids.length} users deleted` };
  })
```

### `isBulk(): boolean`

Returns whether this action is a bulk action.

---

## Data Attributes & Meta

### `meta(value: Record<string, any>): this`

Attaches arbitrary metadata to the action. This data is included in the serialized output and available to the frontend.

```ts
Action.make('export')
  .meta({ format: 'csv', maxRows: 10000 })
```

### `dataAttributes(value: Record<string, string>): this`

Sets HTML `data-*` attributes for the action element in the frontend.

```ts
Action.make('track')
  .dataAttributes({ 'data-event': 'click_track', 'data-category': 'actions' })
```

---

## Download

### `download(value?: boolean): this`

Marks the action as a download action. When serialized, the `download` flag tells the frontend to handle the response as a file download. Defaults to `true`.

```ts
Action.make('downloadReport', 'Download Report')
  .download()
  .handle(async (item) => {
    return { url: `/reports/${item.id}/download` };
  })
```

---

## Getter Methods

| Method | Return Type | Description |
|---|---|---|
| `getName()` | `string` | The action's unique name |
| `getLabel()` | `string` | The display label |
| `isBulk()` | `boolean` | Whether this is a bulk action |
| `isAuthorized(user)` | `boolean` | Whether the user is authorized |
| `isDisabledFor(item)` | `boolean` | Whether the action is disabled for a row |
| `isHiddenFor(item)` | `boolean` | Whether the action is hidden for a row |
| `resolveUrl(item)` | `string \| null` | Resolves the URL for a row |

---

## Serialization

### `toArray(): ActionSerialized`

Serializes the action for the frontend. Only serializable data is included -- **callbacks and handler functions are never serialized**.

```ts
interface ActionSerialized {
  name: string;                           // Unique identifier
  label: string;                          // Display text
  type: ActionType;                       // 'button' or 'link'
  variant: Variant;                       // Visual style
  icon: string | null;                    // Icon identifier
  confirm: ActionConfirm | null;          // Confirmation dialog config
  download: boolean;                      // Whether to treat as download
  meta: Record<string, any> | null;       // Custom metadata
  dataAttributes: Record<string, string> | null;  // HTML data attributes
}
```

**Not included in serialization:**
- `handle` / `before` / `after` callbacks (executed server-side only)
- `authorize` callback (evaluated server-side)
- `disabled` / `hidden` callbacks (resolved per-row during data transformation)
- `url` resolver (resolved per-row during data transformation)
- `bulk` flag (actions are already split into `row` and `bulk` arrays in the meta)

**Per-row serialization:** During `TableQueryService.transformItem()`, each row gets an `_actions` array where each action is extended with:

```ts
{
  ...action.toArray(),
  url: action.resolveUrl(item),        // Resolved URL for this row
  disabled: action.isDisabledFor(item), // Whether disabled for this row
  hidden: action.isHiddenFor(item),     // Whether hidden for this row
}
```

---

## Row Actions vs Bulk Actions

The table module separates actions into two categories based on the `bulk()` flag.

### Row Actions

Row actions appear in each table row (typically in an `ActionColumn` cell or a dropdown menu). They operate on a single entity.

- Defined by **not** calling `bulk()` (default)
- Appear as buttons/links per row
- The `handle()` callback receives the individual entity as `item`
- The `disabled()` and `hidden()` callbacks receive the row entity
- The `url()` resolver receives the row entity

```ts
Action.make('edit', 'Edit')
  .asLink()
  .icon('pencil')
  .url((row) => `/users/${row.id}/edit`)
```

### Bulk Actions

Bulk actions appear in a dropdown above the table when rows are selected. They operate on multiple selected entities.

- Defined by calling `bulk()` or `bulk(true)`
- Appear in a `BulkActionsDropdown` component
- The `handle()` callback receives an array of selected IDs
- Only visible when `hasSelection` is `true`

```ts
Action.make('bulkDelete', 'Delete Selected')
  .bulk()
  .variant(Variant.Destructive)
  .handle(async (ids: string[], repo) => {
    await repo.softDelete(ids);
  })
```

### API Endpoint

Both row and bulk actions are executed via the same endpoint:

```
POST /table/action/:tableClass/:actionName
```

**Request body:**

```ts
// Row action
{ "id": "123" }

// Bulk action
{ "ids": ["123", "456", "789"] }
```

The controller finds the action by name across both row and bulk action lists, then calls `action.execute(body.id ?? body.ids, repo)`.

---

## Soft Delete Auto-Actions

When `@TableConfig({ softDeletes: true })` is set, `BaseTable.getRowActions()` automatically adds two actions if they are not already defined:

### Restore Action

```ts
Action.make('restore', 'Restore')
  .asButton()
  .variant(Variant.Success)
  .confirm({
    title: 'Restore this item?',
    message: 'This will restore the item from trash.',
  })
  .handle(async (item, repo) => {
    await repo.restore(item.id);
  })
```

### Force Delete Action

```ts
Action.make('forceDelete', 'Force Delete')
  .asButton()
  .variant(Variant.Destructive)
  .confirm({
    title: 'Permanently delete?',
    message: 'This action cannot be undone.',
  })
  .handle(async (item, repo) => {
    await repo.delete(item.id);
  })
```

You can override these by defining actions with the same names (`'restore'` or `'forceDelete'`) in your `actions()` method.

---

## Frontend Integration

### `useActions` Composable

The `useActions` composable manages row selection, action execution, and confirmation dialogs.

```ts
const {
  // Selection state
  selectedIds,          // Ref<Set<string>> -- currently selected row IDs
  allSelected,          // Computed<boolean>
  hasSelection,         // Computed<boolean> -- true when any rows selected
  selectedCount,        // Computed<number> -- count of selected rows

  // Confirmation state
  confirmAction,        // Ref<ActionDef | null> -- action awaiting confirmation
  pendingAction,        // Ref<{ action, payload } | null>

  // Selection methods
  toggleSelect,         // (id: string) => void
  toggleSelectAll,      // (ids: string[]) => void
  clearSelection,       // () => void

  // Execution methods
  executeAction,        // (tableClass, action, payload?) => Promise
  executeConfirmedAction, // (tableClass) => Promise
  cancelAction,         // () => void
} = useActions();
```

### Execution Flow

1. User clicks an action button
2. `executeAction(tableClass, action, payload)` is called
3. If the action has a `confirm` config, it stores the pending action and shows the dialog
4. User confirms -> `executeConfirmedAction(tableClass)` is called
5. For `link` type actions: navigates to `action.url`
6. For `button` type actions: sends `POST /table/action/:tableClass/:actionName` with the payload
7. Returns the JSON response

### Frontend Action Type

```ts
interface ActionDef {
  name: string;
  label: string;
  type: 'button' | 'link';
  variant: string;
  icon?: string | null;
  confirm?: ActionConfirm | null;
  disabled?: boolean;           // Per-row, resolved by backend
  hidden?: boolean;             // Per-row, resolved by backend
  url?: string;                 // Per-row, resolved by backend
  download?: boolean;
  meta?: Record<string, any> | null;
  dataAttributes?: Record<string, string> | null;
}
```

---

## Complete Example

```ts
import { BaseTable } from '@nestjs-table-module/backend';
import { TableConfig } from '@nestjs-table-module/backend';
import { Action, Variant, ExportFormat, SortDirection, PaginationType } from '@nestjs-table-module/backend';
import { TextColumn, DateTimeColumn, BadgeColumn, ActionColumn } from '@nestjs-table-module/backend';

@TableConfig({
  resource: UserEntity,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
  softDeletes: true,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable().searchable(),
      BadgeColumn.make('status').variant({
        active: 'success',
        inactive: 'destructive',
      }),
      DateTimeColumn.make('createdAt').sortable(),
      ActionColumn.make(),
    ];
  }

  actions() {
    return [
      // Row action: navigate to edit page
      Action.make('edit', 'Edit')
        .asLink()
        .icon('pencil')
        .url((row) => `/users/${row.id}/edit`),

      // Row action: soft delete with confirmation
      Action.make('delete', 'Delete')
        .asButton()
        .variant(Variant.Destructive)
        .icon('trash')
        .confirm({
          title: 'Delete user?',
          message: 'This action cannot be undone. The user will be moved to trash.',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
        })
        .authorize((user) => user.role === 'admin')
        .disabled((item) => item.status === 'protected')
        .handle(async (item, repo) => {
          await repo.softDelete(item.id);
          return { message: 'User deleted successfully' };
        }),

      // Row action: conditionally visible
      Action.make('approve', 'Approve')
        .asButton()
        .variant(Variant.Success)
        .icon('check')
        .hidden((item) => item.status !== 'pending')
        .handle(async (item, repo) => {
          await repo.update(item.id, { status: 'approved' });
        }),

      // Bulk action: delete selected
      Action.make('bulkDelete', 'Delete Selected')
        .bulk()
        .variant(Variant.Destructive)
        .icon('trash')
        .confirm({ title: 'Delete selected users?' })
        .handle(async (ids, repo) => {
          await repo.softDelete(ids);
          return { message: `${ids.length} users deleted` };
        }),

      // Bulk action: export selected (with lifecycle hooks)
      Action.make('bulkExport', 'Export Selected')
        .bulk()
        .variant(Variant.Secondary)
        .icon('download')
        .before(async (ids) => {
          console.log(`Exporting ${ids.length} users`);
        })
        .handle(async (ids, repo) => {
          const users = await repo.findByIds(ids);
          return { data: users, count: users.length };
        })
        .after(async (_ids, result) => {
          console.log(`Exported ${result.count} users`);
        }),
    ];
  }
}
```
