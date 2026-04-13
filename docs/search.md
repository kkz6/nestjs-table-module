# Search

The table module provides global search that filters across multiple columns simultaneously. Search can be configured at the column level, the config level, or both.

## Column-Level Search

Mark individual columns as searchable using the `.searchable()` builder method:

```typescript
import { TextColumn } from '@nestjs-table-module/backend';

columns() {
  return [
    TextColumn.make('name').sortable().searchable(),
    TextColumn.make('email').sortable().searchable(),
    TextColumn.make('phone'), // not searchable
  ];
}
```

When a column is marked as `searchable()`, its attribute name is included in the list of fields searched when the user types in the search input.

## Config-Level Search

You can also declare searchable fields in the `@TableConfig` decorator:

```typescript
@TableConfig({
  resource: UserEntity,
  searchable: ['name', 'email'],
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      TextColumn.make('name').sortable(),
      TextColumn.make('email').sortable(),
    ];
  }
}
```

This approach is useful when you want to search fields that are not displayed as columns, or when you want to centralize the searchable field list.

## Combining Both

You can use both column-level and config-level search together. The module merges them automatically:

```typescript
@TableConfig({
  resource: UserEntity,
  searchable: ['phone', 'address'], // extra fields to search
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),   // column-level
      TextColumn.make('email').sortable().searchable(),   // column-level
      TextColumn.make('phone'),
    ];
  }
}
```

In this example, the search will query across `name`, `email`, `phone`, and `address`. The `BaseTable.toMeta()` method combines both sources when determining whether search is enabled and when generating the placeholder text.

## How Search Works

When a search term is submitted, the `TableQueryService.applySearch()` method builds an OR query across all searchable fields using `ILIKE`:

```sql
WHERE (
  entity.name ILIKE '%john%'
  OR entity.email ILIKE '%john%'
  OR entity.phone ILIKE '%john%'
  OR entity.address ILIKE '%john%'
)
```

Key behaviors:

- The search is case-insensitive (`ILIKE`).
- The search term is wrapped with `%` on both sides (contains match).
- All searchable fields are combined with `OR`.
- The entire search clause is wrapped in parentheses and combined with existing filters using `AND`.
- Nested attributes (e.g., `department.name`) are resolved using joined relations.

### Nested Column Search

If a searchable column references a relation (e.g., `department.name`), the query service automatically resolves it:

```typescript
TextColumn.make('department.name').searchable()
```

This generates:

```sql
WHERE department.name ILIKE '%term%'
```

The relation join is handled automatically by `applyEagerLoading()`.

## Search Placeholder

The search input placeholder is auto-generated from the searchable column headers and config field names. For example, if `name` and `email` are searchable, the placeholder reads:

```
Search by name, email...
```

## Frontend SearchInput Component

The `SearchInput` component renders a text input with a search icon:

```vue
<SearchInput
  :model-value="search"
  :placeholder="meta.search.placeholder"
  @update:model-value="setSearch"
/>
```

### Props

| Prop          | Type   | Default      | Description                  |
|---------------|--------|--------------|------------------------------|
| `modelValue`  | string | -            | The current search value     |
| `placeholder` | string | `"Search..."` | Placeholder text             |

### Events

| Event              | Payload  | Description                          |
|--------------------|----------|--------------------------------------|
| `update:modelValue`| `string` | Emitted on every input change        |

### Debouncing

The `SearchInput` component itself does not debounce. Debouncing is handled by the `useTable` composable's `setSearch()` method, which uses `debouncedFetch()`. The debounce delay defaults to `300ms` and can be configured:

- Backend: `debounce: 500` in `@TableConfig`
- Frontend: `:debounce="500"` prop on `DataTable`

```vue
<DataTable endpoint="/api/users" :debounce="500" />
```

## URL Synchronization

When `syncUrl` is enabled, the search term is synced to the URL:

```
/users?search=john&page=1&limit=15
```

On page load, if a `search` parameter exists in the URL, the `useTable` composable initializes the search input with that value and triggers a fetch.

## Resetting the Page

When the search term changes, the page is automatically reset to `1` to ensure the user sees results from the beginning.
