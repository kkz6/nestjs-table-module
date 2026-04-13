# Empty States

The `EmptyState` class lets you configure what users see when a table has no data. You can set a title, message, icon, and a call-to-action button.

## Defining an Empty State

Override the `emptyState()` method in your table class:

```typescript
import { EmptyState } from '@nestjs-table-module/backend';

export class UsersTable extends BaseTable<UserEntity> {
  // ... columns, filters, etc.

  emptyState() {
    return EmptyState.make()
      .title('No users found')
      .message('Try adjusting your search or filter criteria, or create a new user.')
      .icon('users')
      .action({ label: 'Create User', url: '/users/create' });
  }
}
```

## Builder Methods

All methods are chainable and return `this`.

### `EmptyState.make()`

Static factory method that creates a new `EmptyState` instance.

```typescript
const empty = EmptyState.make();
```

### `.title(t: string)`

Sets the primary heading text displayed in the empty state.

```typescript
EmptyState.make().title('No results found')
```

### `.message(m: string)`

Sets the descriptive text displayed below the title.

```typescript
EmptyState.make()
  .title('No orders yet')
  .message('When customers place orders, they will appear here.')
```

### `.icon(i: string)`

Sets an icon identifier. The frontend can use this to render an appropriate icon.

```typescript
EmptyState.make()
  .title('No products')
  .icon('package')
```

### `.action(config: { label: string; url: string })`

Adds a call-to-action button with a label and URL.

```typescript
EmptyState.make()
  .title('No users found')
  .action({ label: 'Create User', url: '/users/create' })
```

## Serialization

The `toArray()` method converts the `EmptyState` to a plain object for the frontend:

```json
{
  "title": "No users found",
  "message": "Try adjusting your search or filter criteria, or create a new user.",
  "icon": "users",
  "action": {
    "label": "Create User",
    "url": "/users/create"
  }
}
```

This object is included in the `TableMeta` response under the `emptyState` key. If no empty state is defined, the value is `null`.

## Frontend EmptyState Component

The `EmptyState` Vue component renders the empty state UI.

### Props

| Prop     | Type                    | Default | Description                          |
|----------|-------------------------|---------|--------------------------------------|
| `config` | `EmptyStateDef \| null` | -       | The empty state configuration object |

### Rendering

The component renders:

1. An icon (if `config.icon` is set) -- displayed as a 48x48 SVG in muted foreground color.
2. A title -- rendered as an `<h3>` with `text-lg font-semibold`. Defaults to "No results found" if no config is provided.
3. A message (if `config.message` is set) -- rendered as a `<p>` in muted foreground color.
4. An action button (if `config.action` is set) -- rendered as an `<a>` wrapping a `<Button>`.

### When It Shows

The empty state is displayed when:

- `isEmpty` is `true` (no data in the response array).
- `isLoading` is `false` (the fetch has completed).

In the `DataTable` component:

```vue
<EmptyState v-if="isEmpty && !isLoading" :config="meta?.emptyState" />
```

This ensures the empty state never flashes during loading.

## Examples

### Minimal Empty State

```typescript
emptyState() {
  return EmptyState.make()
    .title('No data available');
}
```

### Full Empty State

```typescript
emptyState() {
  return EmptyState.make()
    .title('No products found')
    .message('Your inventory is empty. Add your first product to get started.')
    .icon('package')
    .action({ label: 'Add Product', url: '/products/new' });
}
```

### No Empty State

If you do not override `emptyState()`, the base class returns `null` and the frontend falls back to a default "No results found" message.

```typescript
// BaseTable default:
emptyState(): EmptyState | null {
  return null;
}
```

The frontend `EmptyState` component handles this gracefully:

```vue
<h3 class="text-lg font-semibold">{{ config?.title ?? 'No results found' }}</h3>
```
