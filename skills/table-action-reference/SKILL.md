---
name: table-action-reference
description: Use when adding row actions, bulk actions, or confirmation dialogs to a table — reference for the Action builder API
---

# Table Action Reference

## Overview

Actions are operations users can perform on table rows (edit, delete, view) or on multiple selected rows (bulk delete, bulk export). Defined via chainable `Action.make()` builder in the table's `actions()` method.

## Row Actions vs Bulk Actions

```typescript
actions() {
  return [
    // Row action — operates on single item
    Action.make('edit').asLink().url((row) => `/users/${row.id}/edit`),

    // Row action with handler
    Action.make('delete').asButton()
      .variant(Variant.Destructive)
      .confirm({ title: 'Delete?' })
      .handle(async (item, repo) => repo.softDelete(item.id)),

    // Bulk action — operates on selected items
    Action.make('bulkDelete', 'Delete Selected')
      .bulk()
      .variant(Variant.Destructive)
      .confirm({ title: 'Delete all selected?' })
      .handle(async (ids, repo) => repo.softDelete(ids)),
  ];
}
```

## Builder API

### Factory
```typescript
Action.make('name')              // Label auto-generated: 'Name'
Action.make('name', 'My Label')  // Explicit label
```

### Type
```typescript
.asButton()   // Renders as button, executes handler (default)
.asLink()     // Renders as link, navigates to URL
```

### Styling
```typescript
.variant(Variant.Destructive)  // Default|Info|Success|Warning|Destructive|Secondary|Outline|Ghost|Link
.icon('trash')                 // Icon name for frontend
```

### Confirmation Dialog
```typescript
.confirm({
  title: 'Are you sure?',           // Required
  message: 'This cannot be undone.', // Optional
  confirmLabel: 'Yes, delete',       // Optional, default: 'Confirm'
  cancelLabel: 'No, keep it',        // Optional, default: 'Cancel'
})
```

### Handler (3-phase lifecycle)
```typescript
.before(async (item) => { /* pre-check, logging */ })
.handle(async (item, repo) => {
  // Main logic — item is the row object (row action) or id array (bulk action)
  await repo.softDelete(item.id);
  return { message: 'Deleted' };  // Optional return value
})
.after(async (item, result) => { /* cleanup, notifications */ })
```

### Authorization & Visibility
```typescript
.authorize((user) => user.role === 'admin')     // Gate access entirely
.disabled((item) => item.status === 'locked')    // Grayed out per row
.hidden((item) => item.role === 'admin')         // Hidden per row
```

### URL (for link actions)
```typescript
.url((item) => `/users/${item.id}/edit`)   // Dynamic per row
```

### Bulk
```typescript
.bulk()      // Marks as bulk action — receives string[] of IDs
.isBulk()    // Check if bulk
```

### Other
```typescript
.download()                    // Triggers file download
.meta({ key: 'value' })       // Arbitrary metadata
.dataAttributes({ action: 'delete' })  // HTML data attributes
```

## Soft Delete Auto-Actions

When `softDeletes: true`, these are auto-added:
- **Restore** — `Variant.Success`, confirms, calls `repo.restore(id)`
- **Force Delete** — `Variant.Destructive`, confirms, calls `repo.delete(id)`

These only appear when viewing trashed items.

## API Endpoint

```
POST /table/action/:tableClass/:actionName
Body: { id: "123" }          // Row action
Body: { ids: ["1","2","3"] } // Bulk action
```

## Common Mistakes

- **Forgetting `.bulk()`** — Without it, action appears per-row, not in bulk dropdown
- **No `ActionColumn.make()` in columns** — Row actions won't render
- **Handler returning nothing** — Returns `{ success: true }` by default, which is fine
- **Using `.url()` with `.handle()`** — Link actions navigate; button actions execute handlers. Pick one.
