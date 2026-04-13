# Table Configuration

Every table in the NestJS Table Module is defined by two things:

1. The **`@TableConfig` decorator** -- declares how the table behaves (entity, pagination, sorting, etc.)
2. The **`BaseTable` class** -- provides overridable methods for columns, filters, actions, and exports

---

## @TableConfig Decorator

The `@TableConfig` decorator attaches metadata to your table class. It accepts a single `TableConfigOptions` object.

```typescript
import { TableConfig } from '@kkmodules/nestjs-table';

@TableConfig({ /* options */ })
export class UsersTable extends BaseTable<UserEntity> {
  // ...
}
```

### Interface

```typescript
interface TableConfigOptions {
  resource: Function;                                 // Required
  defaultSort?: { column: string; direction: SortDirection };
  pagination?: PaginationType;
  perPageOptions?: number[];
  defaultPerPage?: number;
  softDeletes?: boolean;
  searchable?: string[];
  stickyHeader?: boolean;
  debounce?: number;
  scrollPosition?: ScrollPosition;
}
```

---

### resource (required)

The TypeORM entity class that this table queries. This is the only required option.

**Type:** `Function` (a class reference)

```typescript
import { UserEntity } from '../entities/user.entity';

@TableConfig({
  resource: UserEntity,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

The `resource` is used by `TableQueryService` to create a TypeORM repository and build queries with sorting, filtering, pagination, and search applied.

---

### defaultSort

Sets the default sort column and direction when the table first loads. If not specified, no default sort is applied.

**Type:** `{ column: string; direction: SortDirection }`

```typescript
import { SortDirection } from '@kkmodules/nestjs-table';

@TableConfig({
  resource: UserEntity,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

**SortDirection enum values:**

| Value                | String   | Description        |
|----------------------|----------|--------------------|
| `SortDirection.Asc`  | `'asc'`  | Ascending order    |
| `SortDirection.Desc` | `'desc'` | Descending order   |

The `column` must match the `attribute` of a sortable column (or any valid entity field).

---

### pagination

Controls the pagination strategy for the table.

**Type:** `PaginationType`  
**Default:** `PaginationType.Full`

```typescript
import { PaginationType } from '@kkmodules/nestjs-table';

@TableConfig({
  resource: UserEntity,
  pagination: PaginationType.Full,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

**PaginationType enum values:**

| Value                    | String     | Description                                                                                                     |
|--------------------------|------------|-----------------------------------------------------------------------------------------------------------------|
| `PaginationType.Full`   | `'full'`   | Standard offset-based pagination with total count, page numbers, first/last page links. Best for general use.   |
| `PaginationType.Simple` | `'simple'` | Lightweight pagination with only next/previous links. No total count query. Better for large datasets.           |
| `PaginationType.Cursor` | `'cursor'` | Cursor-based pagination using opaque cursor tokens. Best for real-time data or infinite scroll.                  |

**Example with Simple pagination:**

```typescript
@TableConfig({
  resource: LogEntity,
  pagination: PaginationType.Simple,
})
export class LogsTable extends BaseTable<LogEntity> {
  columns() { return []; }
}
```

**Example with Cursor pagination:**

```typescript
@TableConfig({
  resource: NotificationEntity,
  pagination: PaginationType.Cursor,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
})
export class NotificationsTable extends BaseTable<NotificationEntity> {
  columns() { return []; }
}
```

---

### perPageOptions

An array of integers representing the page size options shown in the pagination dropdown.

**Type:** `number[]`  
**Default:** `[15, 30, 50, 100]`

```typescript
@TableConfig({
  resource: UserEntity,
  perPageOptions: [10, 25, 50],
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

The first value in the array is used as the default page size unless `defaultPerPage` is also specified.

---

### defaultPerPage

Sets the default number of rows per page. If not set, the first value in `perPageOptions` is used.

**Type:** `number`  
**Default:** First value of `perPageOptions` (which defaults to `15`)

```typescript
@TableConfig({
  resource: UserEntity,
  perPageOptions: [10, 25, 50, 100],
  defaultPerPage: 25,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

---

### softDeletes

When `true`, the table system automatically adds:

1. A **TrashedFilter** to the filters list -- allows users to show/hide soft-deleted records
2. A **Restore** row action -- restores soft-deleted records
3. A **Force Delete** row action -- permanently deletes soft-deleted records

Both auto-added actions include confirmation dialogs and are hidden when the record is not trashed.

**Type:** `boolean`  
**Default:** `false`

```typescript
@TableConfig({
  resource: UserEntity,
  softDeletes: true,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

Your entity must use TypeORM's `@DeleteDateColumn()` for soft deletes to work:

```typescript
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

The auto-generated **Restore** action:
- Styled as a `Variant.Success` button
- Shows confirmation: "Restore this item?"
- Hidden when the record is not trashed
- Calls `repo.restore(item.id)`

The auto-generated **Force Delete** action:
- Styled as a `Variant.Destructive` button
- Shows confirmation: "Permanently delete?"
- Hidden when the record is not trashed
- Calls `repo.delete(item.id)`

You can override these by defining actions with the names `restore` or `forceDelete` in your `actions()` method -- the auto-generation checks for existing names before adding.

---

### searchable

An array of additional field names that the global search should query, beyond those marked as `searchable()` on individual columns.

**Type:** `string[]`  
**Default:** `[]`

```typescript
@TableConfig({
  resource: UserEntity,
  searchable: ['name', 'email', 'phone'],
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      // Even if 'phone' is not a visible column, the global search will include it
      TextColumn.make('name').searchable(),
      TextColumn.make('email').searchable(),
    ];
  }
}
```

The final set of searchable fields is the union of:
- Columns marked with `.searchable()`
- Fields listed in `searchable`

---

### stickyHeader

When `true`, the table header row sticks to the top of the viewport as the user scrolls. The frontend `useStickyTable` composable applies the appropriate CSS.

**Type:** `boolean`  
**Default:** `false`

```typescript
@TableConfig({
  resource: UserEntity,
  stickyHeader: true,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

---

### debounce

The debounce time (in milliseconds) for search input. The frontend waits this long after the user stops typing before making a request.

**Type:** `number` (milliseconds)  
**Default:** `300`

```typescript
@TableConfig({
  resource: UserEntity,
  debounce: 500, // Wait 500ms after the user stops typing
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

A lower value makes search feel more responsive; a higher value reduces the number of API calls.

---

### scrollPosition

Controls where the page scrolls after a pagination change (next page, previous page, per-page change).

**Type:** `ScrollPosition`  
**Default:** `ScrollPosition.TopOfPage`

```typescript
import { ScrollPosition } from '@kkmodules/nestjs-table';

@TableConfig({
  resource: UserEntity,
  scrollPosition: ScrollPosition.TopOfTable,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() { return []; }
}
```

**ScrollPosition enum values:**

| Value                         | String          | Description                                                    |
|-------------------------------|-----------------|----------------------------------------------------------------|
| `ScrollPosition.TopOfPage`   | `'topOfPage'`   | Scroll to the top of the page after a page change              |
| `ScrollPosition.TopOfTable`  | `'topOfTable'`  | Scroll to the top of the table element after a page change     |
| `ScrollPosition.Preserve`    | `'preserve'`    | Keep the current scroll position after a page change           |

---

## BaseTable Class

All table definitions extend `BaseTable<T>`, where `T` is the TypeORM entity type. `BaseTable` is an abstract class that requires you to implement `columns()` and provides optional methods for filters, actions, exports, and empty state.

```typescript
import { BaseTable } from '@kkmodules/nestjs-table';

@TableConfig({ resource: UserEntity })
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      TextColumn.make('name'),
    ];
  }
}
```

---

### Methods You Override

These are the methods you define in your table subclass.

#### columns() -- Required

Returns an array of `Column` instances that define the columns displayed in the table.

**Signature:** `columns(): Column[]`

```typescript
columns() {
  return [
    TextColumn.make('name').sortable().searchable(),
    TextColumn.make('email').sortable().searchable(),
    NumericColumn.make('age').sortable(),
    DateTimeColumn.make('createdAt').sortable().format('YYYY-MM-DD HH:mm'),
    ActionColumn.make(),
  ];
}
```

Every table must implement this method. See the [Columns documentation](./columns.md) for all available column types and methods.

---

#### filters() -- Optional

Returns an array of `Filter` instances for the table's filter panel.

**Signature:** `filters(): Filter[]`  
**Default:** `[]` (no filters)

```typescript
import {
  TextFilter, SetFilter, DateFilter, BooleanFilter, NumericFilter,
} from '@kkmodules/nestjs-table';

filters() {
  return [
    TextFilter.make('name'),
    TextFilter.make('email'),
    SetFilter.make('status').options([
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ]),
    DateFilter.make('createdAt'),
    BooleanFilter.make('isActive'),
    NumericFilter.make('age'),
  ];
}
```

Available filter types:

| Filter          | Description                                              |
|-----------------|----------------------------------------------------------|
| `TextFilter`    | Free-text filter with clauses: contains, starts with, etc. |
| `NumericFilter` | Numeric comparison filter: equals, greater than, etc.     |
| `DateFilter`    | Date range and comparison filter                          |
| `SetFilter`     | Dropdown with predefined option values                    |
| `BooleanFilter` | True/false toggle filter                                  |
| `TrashedFilter` | Auto-added when `softDeletes: true`; shows/hides trashed  |

---

#### actions() -- Optional

Returns an array of `Action` instances that define row-level and bulk actions.

**Signature:** `actions(): Action[]`  
**Default:** `[]` (no actions)

```typescript
import { Action, Variant } from '@kkmodules/nestjs-table';

actions() {
  return [
    // Link action — navigates to a URL
    Action.make('edit', 'Edit')
      .asLink()
      .icon('pencil')
      .url((row) => `/users/${row.id}/edit`),

    // Button action — executes server-side logic
    Action.make('delete', 'Delete')
      .asButton()
      .variant(Variant.Destructive)
      .icon('trash')
      .confirm({
        title: 'Delete user?',
        message: 'This action cannot be undone.',
      })
      .handle(async (item, repo) => {
        await repo.softDelete(item.id);
      }),

    // Bulk action — operates on multiple selected rows
    Action.make('bulkDelete', 'Delete Selected')
      .bulk()
      .variant(Variant.Destructive)
      .confirm({ title: 'Delete selected users?' })
      .handle(async (ids, repo) => {
        await repo.softDelete(ids);
      }),
  ];
}
```

---

#### exports() -- Optional

Returns an array of `Export` instances for download options.

**Signature:** `exports(): Export[]`  
**Default:** `[]` (no exports)

```typescript
import { Export, ExportFormat } from '@kkmodules/nestjs-table';

exports() {
  return [
    Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx),
    Export.make('CSV', 'users.csv', ExportFormat.Csv),
    Export.make('PDF', 'users.pdf', ExportFormat.Pdf),
  ];
}
```

**ExportFormat enum values:**

| Value                   | String  | Description      |
|-------------------------|---------|------------------|
| `ExportFormat.Xlsx`     | `'xlsx'`| Excel format     |
| `ExportFormat.Csv`      | `'csv'` | CSV format       |
| `ExportFormat.Pdf`      | `'pdf'` | PDF format       |

Exports can be further configured:

```typescript
Export.make('Filtered Excel', 'users-filtered.xlsx', ExportFormat.Xlsx)
  .label('Export Filtered Users')
  .filteredOnly(true)      // Only export rows matching current filters
  .selectedOnly(false)     // Export all filtered rows, not just selected
  .authorize((user) => user.role === 'admin')  // Restrict to admins
```

---

#### emptyState() -- Optional

Returns an `EmptyState` instance shown when the table has no data and is in its default state (no active search or filters).

**Signature:** `emptyState(): EmptyState | null`  
**Default:** `null` (no custom empty state)

```typescript
import { EmptyState } from '@kkmodules/nestjs-table';

emptyState() {
  return EmptyState.make()
    .title('No users found')
    .message('Try adjusting your search or filter criteria, or create a new user.')
    .icon('users')
    .action({ label: 'Create User', url: '/users/create' });
}
```

**EmptyState methods:**

| Method                              | Description                                    |
|-------------------------------------|------------------------------------------------|
| `EmptyState.make()`                 | Static factory -- creates a new EmptyState     |
| `.title(string)`                    | Set the heading text                           |
| `.message(string)`                  | Set the description text                       |
| `.icon(string)`                     | Set the icon name (from your icon library)     |
| `.action({ label, url })`          | Add a call-to-action button with a link        |
| `.toArray()`                        | Serialize to a plain object                    |

---

### Methods Available on BaseTable

These methods are available on your table instance (inherited from `BaseTable`) and are used internally by the framework. You can also call them in your controllers or services.

#### getConfig()

Returns the `TableConfigOptions` from the `@TableConfig` decorator. Throws an error if the decorator is missing.

**Signature:** `getConfig(): TableConfigOptions`

```typescript
const table = new UsersTable();
const config = table.getConfig();

console.log(config.resource);       // UserEntity
console.log(config.softDeletes);    // true
console.log(config.perPageOptions); // [15, 30, 50, 100]
```

---

#### getColumns()

Returns the array of columns from your `columns()` method.

**Signature:** `getColumns(): Column[]`

```typescript
const columns = table.getColumns();
columns.forEach(col => {
  console.log(col.getAttribute(), col.getHeader(), col.isSortable());
});
```

---

#### getSearchableColumns()

Returns only the columns where `isSearchable()` is `true`.

**Signature:** `getSearchableColumns(): Column[]`

```typescript
const searchable = table.getSearchableColumns();
// Returns columns that have .searchable() called on them
```

---

#### getFilters()

Returns the filters from your `filters()` method plus any auto-added filters. When `softDeletes` is `true`, a `TrashedFilter` is automatically appended if one does not already exist.

**Signature:** `getFilters(): Filter[]`

```typescript
const filters = table.getFilters();
// Includes TrashedFilter if softDeletes is true
```

---

#### getRowActions()

Returns non-bulk actions from your `actions()` method plus any auto-added soft-delete actions. When `softDeletes` is `true`, `Restore` and `Force Delete` actions are automatically appended if not already defined.

**Signature:** `getRowActions(): Action[]`

```typescript
const rowActions = table.getRowActions();
// Includes restore and forceDelete if softDeletes is true
```

---

#### getBulkActions()

Returns only the actions where `isBulk()` is `true`.

**Signature:** `getBulkActions(): Action[]`

```typescript
const bulkActions = table.getBulkActions();
```

---

#### getExports()

Returns the array of exports from your `exports()` method.

**Signature:** `getExports(): Export[]`

```typescript
const exports = table.getExports();
```

---

#### toMeta()

Serializes the entire table definition into a `TableMeta` object suitable for sending to the frontend. This is typically called by `TableQueryService` and included in the API response.

**Signature:** `toMeta(): TableMeta`

```typescript
const meta = table.toMeta();

// Returns:
// {
//   columns: [...],
//   filters: [...],
//   actions: { row: [...], bulk: [...] },
//   exports: [...],
//   search: { enabled: true, placeholder: 'Search by name, email...' },
//   perPageOptions: [15, 30, 50, 100],
//   softDeletes: true,
//   stickyHeader: true,
//   debounce: 300,
//   scrollPosition: 'topOfPage',
//   views: [],
//   emptyState: { title: '...', message: '...', icon: '...', action: {...} },
// }
```

The `TableMeta` interface:

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

---

#### getRegistryName() / setRegistryName(name)

Gets or sets the name used to look up this table in the `TableRegistry`. By default, the registry name is the class name (e.g., `'UsersTable'`).

**Signatures:**
- `getRegistryName(): string`
- `setRegistryName(name: string): void`

```typescript
const table = new UsersTable();
console.log(table.getRegistryName()); // 'UsersTable'

table.setRegistryName('users');
console.log(table.getRegistryName()); // 'users'
```

When tables are registered via `TableModule.forRoot()`, `setRegistryName()` is called automatically by the `TableRegistry`.

---

## Complete Example

Here is a fully configured table combining all options and methods:

```typescript
import { BaseTable, TableConfig } from '@kkmodules/nestjs-table';
import {
  TextColumn, NumericColumn, DateColumn, DateTimeColumn,
  BadgeColumn, BooleanColumn, ImageColumn, ActionColumn,
} from '@kkmodules/nestjs-table';
import {
  TextFilter, NumericFilter, SetFilter, DateFilter, BooleanFilter,
} from '@kkmodules/nestjs-table';
import { Action, Export, EmptyState } from '@kkmodules/nestjs-table';
import {
  SortDirection, PaginationType, ScrollPosition,
  Variant, ExportFormat, ImageSize,
} from '@kkmodules/nestjs-table';
import { ProductEntity } from '../entities/product.entity';

@TableConfig({
  resource: ProductEntity,
  defaultSort: { column: 'name', direction: SortDirection.Asc },
  pagination: PaginationType.Full,
  perPageOptions: [10, 25, 50],
  defaultPerPage: 25,
  softDeletes: false,
  searchable: ['sku', 'description'],
  stickyHeader: true,
  debounce: 250,
  scrollPosition: ScrollPosition.TopOfTable,
})
export class ProductsTable extends BaseTable<ProductEntity> {
  columns() {
    return [
      ImageColumn.make('thumbnailUrl', 'Image')
        .size(ImageSize.Small)
        .rounded()
        .notSortable()
        .notToggleable(),
      TextColumn.make('name')
        .sortable()
        .searchable()
        .wrap()
        .truncate(2),
      TextColumn.make('sku')
        .sortable()
        .searchable()
        .cellClass('font-mono text-sm'),
      NumericColumn.make('price')
        .sortable()
        .rightAligned()
        .mapAs((value) => `$${(value / 100).toFixed(2)}`),
      NumericColumn.make('stock')
        .sortable()
        .centerAligned(),
      BadgeColumn.make('status')
        .variant({
          in_stock: 'success',
          low_stock: 'warning',
          out_of_stock: 'destructive',
        })
        .icon({
          in_stock: 'check-circle',
          low_stock: 'alert-triangle',
          out_of_stock: 'x-circle',
        }),
      BooleanColumn.make('featured')
        .trueIcon('star')
        .falseIcon('star-off')
        .centerAligned(),
      DateColumn.make('releaseDate')
        .sortable()
        .format('YYYY-MM-DD'),
      DateTimeColumn.make('updatedAt')
        .sortable()
        .format('YYYY-MM-DD HH:mm')
        .hidden(),
      ActionColumn.make(),
    ];
  }

  filters() {
    return [
      TextFilter.make('name'),
      NumericFilter.make('price'),
      SetFilter.make('status').options([
        { value: 'in_stock', label: 'In Stock' },
        { value: 'low_stock', label: 'Low Stock' },
        { value: 'out_of_stock', label: 'Out of Stock' },
      ]),
      BooleanFilter.make('featured'),
      DateFilter.make('releaseDate'),
    ];
  }

  actions() {
    return [
      Action.make('edit', 'Edit')
        .asLink()
        .icon('pencil')
        .url((row) => `/products/${row.id}/edit`),
      Action.make('duplicate', 'Duplicate')
        .asButton()
        .variant(Variant.Secondary)
        .icon('copy')
        .handle(async (item, repo) => {
          const { id, ...data } = item;
          await repo.save({ ...data, name: `${data.name} (Copy)` });
        }),
      Action.make('delete', 'Delete')
        .asButton()
        .variant(Variant.Destructive)
        .icon('trash')
        .confirm({ title: 'Delete this product?' })
        .handle(async (item, repo) => {
          await repo.delete(item.id);
        }),
    ];
  }

  exports() {
    return [
      Export.make('Product Catalog', 'products.xlsx', ExportFormat.Xlsx)
        .filteredOnly(true),
      Export.make('Price List', 'prices.csv', ExportFormat.Csv)
        .filteredOnly(true),
    ];
  }

  emptyState() {
    return EmptyState.make()
      .title('No products yet')
      .message('Add your first product to start building your catalog.')
      .icon('package')
      .action({ label: 'Add Product', url: '/products/create' });
  }
}
```

---

## Next Steps

- [Columns](./columns.md) -- Detailed reference for every column type and method
- [Getting Started](./getting-started.md) -- Installation and initial setup
