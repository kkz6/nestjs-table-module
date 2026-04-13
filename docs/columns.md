# Columns

Columns define what data is displayed in each table cell, how it is sorted, searched, formatted, and exported. Every column type extends the abstract `Column` base class.

---

## Overview of Column Types

| Column Type      | Type String    | Description                                       |
|------------------|----------------|---------------------------------------------------|
| `TextColumn`     | `'text'`       | Plain text display                                |
| `NumericColumn`  | `'numeric'`    | Numeric values                                    |
| `DateColumn`     | `'date'`       | Date values with configurable format              |
| `DateTimeColumn` | `'datetime'`   | Date and time values with configurable format     |
| `BooleanColumn`  | `'boolean'`    | True/false values with labels and icons           |
| `BadgeColumn`    | `'badge'`      | Values displayed as styled badges with variants   |
| `ImageColumn`    | `'image'`      | Image thumbnails with size and position options   |
| `ActionColumn`   | `'action'`     | Row action buttons (edit, delete, etc.)           |

All column classes are imported from the package:

```typescript
import {
  TextColumn,
  NumericColumn,
  DateColumn,
  DateTimeColumn,
  BooleanColumn,
  BadgeColumn,
  ImageColumn,
  ActionColumn,
} from '@kkmodules/nestjs-table';
```

---

## Base Column (Abstract)

The `Column` class is the abstract base for all column types. You never instantiate `Column` directly -- you use one of its concrete subclasses. All methods documented in this section are available on every column type.

### Constructor

```typescript
constructor(attribute: string, header?: string)
```

- `attribute` -- The entity field name (e.g., `'name'`, `'user.email'`)
- `header` -- Optional display label. If omitted, it is auto-generated from the attribute:
  - `'created_at'` becomes `'Created at'`
  - `'department.name'` becomes `'Name'`
  - `'firstName'` becomes `'First name'`

---

### static make(attribute, header?)

Factory method to create a new column instance. Every subclass inherits this.

**Signature:** `static make(attribute: string, header?: string): ColumnSubclass`

**Parameters:**
| Parameter   | Type     | Required | Description                          |
|-------------|----------|----------|--------------------------------------|
| `attribute` | `string` | Yes      | The entity field to display          |
| `header`    | `string` | No       | The column header label              |

**Returns:** An instance of the column subclass.

```typescript
// Auto-generated header: "First name"
TextColumn.make('firstName')

// Custom header
TextColumn.make('firstName', 'Name')

// Nested attribute (relationship)
TextColumn.make('department.name', 'Department')
```

---

### sortable(value?) / notSortable()

Enable or disable sorting for the column. When sortable, clicking the column header in the frontend toggles sort direction.

**Signatures:**
- `sortable(sortable: boolean = true): this`
- `notSortable(): this`

**Parameters:**
| Parameter  | Type      | Default | Description              |
|------------|-----------|---------|--------------------------|
| `sortable` | `boolean` | `true`  | Whether sorting is on    |

**Returns:** `this` (for method chaining)

```typescript
TextColumn.make('name').sortable()        // Sortable
TextColumn.make('name').sortable(true)    // Sortable (explicit)
TextColumn.make('name').notSortable()     // Not sortable
TextColumn.make('name').sortable(false)   // Not sortable
```

---

### searchable(value?) / notSearchable()

Enable or disable global search for this column. Searchable columns are included when the user types in the search input.

**Signatures:**
- `searchable(searchable: boolean = true): this`
- `notSearchable(): this`

**Parameters:**
| Parameter    | Type      | Default | Description                |
|--------------|-----------|---------|----------------------------|
| `searchable` | `boolean` | `true`  | Whether search is enabled  |

**Returns:** `this`

```typescript
TextColumn.make('name').searchable()        // Included in search
TextColumn.make('email').searchable()       // Included in search
TextColumn.make('id').notSearchable()       // Excluded from search (default)
```

---

### toggleable(value?) / notToggleable()

Enable or disable column visibility toggling. Toggleable columns can be shown/hidden by the user via the column visibility dropdown.

**Signatures:**
- `toggleable(toggleable: boolean = true): this`
- `notToggleable(): this`

**Parameters:**
| Parameter    | Type      | Default | Description                     |
|--------------|-----------|---------|---------------------------------|
| `toggleable` | `boolean` | `true`  | Whether the user can toggle it  |

**Returns:** `this`

**Default:** Columns are toggleable by default (`true`), except `ActionColumn` which defaults to not toggleable.

```typescript
TextColumn.make('name').notToggleable()   // Always visible, cannot be hidden
TextColumn.make('notes').toggleable()     // User can show/hide this column
```

---

### visible(value?) / hidden(value?)

Set the default visibility of the column. A hidden column starts as not visible but can be toggled on if it is also toggleable.

**Signatures:**
- `visible(visible: boolean = true): this`
- `hidden(hidden: boolean = true): this`

**Parameters:**
| Parameter | Type      | Default | Description                     |
|-----------|-----------|---------|---------------------------------|
| `visible` | `boolean` | `true`  | Whether column is visible       |
| `hidden`  | `boolean` | `true`  | Inverse of visible              |

**Returns:** `this`

```typescript
TextColumn.make('internalNotes').hidden()          // Hidden by default
TextColumn.make('internalNotes').visible(false)     // Same as hidden()
TextColumn.make('name').visible()                   // Visible (default)
```

Note: A column is always visible if it is not toggleable, regardless of the `visible` setting. The `isVisible()` getter returns `!this._toggleable || this._visible`.

---

### align(alignment) / leftAligned() / centerAligned() / rightAligned()

Set the text alignment for the column.

**Signatures:**
- `align(alignment: ColumnAlignment): this`
- `leftAligned(): this`
- `centerAligned(): this`
- `rightAligned(): this`

**Parameters:**
| Parameter   | Type              | Description            |
|-------------|-------------------|------------------------|
| `alignment` | `ColumnAlignment` | The alignment to apply |

**Returns:** `this`

**ColumnAlignment enum:**

| Value                      | String     | Description  |
|----------------------------|------------|--------------|
| `ColumnAlignment.Left`    | `'left'`   | Left-aligned (default) |
| `ColumnAlignment.Center`  | `'center'` | Center-aligned |
| `ColumnAlignment.Right`   | `'right'`  | Right-aligned  |

```typescript
NumericColumn.make('price').rightAligned()
BooleanColumn.make('active').centerAligned()
TextColumn.make('name').leftAligned()
TextColumn.make('status').align(ColumnAlignment.Center)
```

---

### wrap(value?) / truncate(length)

Control text wrapping and truncation behavior.

**Signatures:**
- `wrap(wrap: boolean = true): this`
- `truncate(value: number | false = 1): this`

**Parameters:**

For `wrap`:
| Parameter | Type      | Default | Description                  |
|-----------|-----------|---------|------------------------------|
| `wrap`    | `boolean` | `true`  | Whether text should wrap     |

For `truncate`:
| Parameter | Type             | Default | Description                                    |
|-----------|------------------|---------|------------------------------------------------|
| `value`   | `number \| false` | `1`     | Number of lines before truncating, or `false` to disable |

**Returns:** `this`

`truncate()` automatically enables `wrap`. When a numeric value is provided, the frontend applies CSS `line-clamp` to limit the text to that many lines with an ellipsis.

```typescript
TextColumn.make('description').wrap()          // Allow text to wrap
TextColumn.make('description').truncate(2)     // Wrap, max 2 lines with ellipsis
TextColumn.make('description').truncate(1)     // Wrap, max 1 line (default)
TextColumn.make('description').truncate(false) // Disable truncation
```

---

### headerClass(value) / cellClass(value)

Set custom CSS classes on the column header (`<th>`) or cell (`<td>`) elements.

**Signatures:**
- `headerClass(cssClass: string | null = null): this`
- `cellClass(cssClass: string | null = null): this`

**Parameters:**
| Parameter  | Type             | Default | Description              |
|------------|------------------|---------|--------------------------|
| `cssClass` | `string \| null` | `null`  | CSS class string         |

**Returns:** `this`

```typescript
TextColumn.make('sku')
  .headerClass('font-bold text-blue-600')
  .cellClass('font-mono text-sm')

NumericColumn.make('price')
  .cellClass('tabular-nums text-right font-medium')

TextColumn.make('name')
  .headerClass('min-w-[200px]')
```

---

### stickable(value?) / notStickable()

Mark the column as stickable. When the table has `stickyHeader: true` and columns overflow horizontally, stickable columns stay fixed while the user scrolls horizontally.

**Signatures:**
- `stickable(stickable: boolean = true): this`
- `notStickable(): this`

**Parameters:**
| Parameter   | Type      | Default | Description                    |
|-------------|-----------|---------|--------------------------------|
| `stickable` | `boolean` | `true`  | Whether the column can stick   |

**Returns:** `this`

```typescript
TextColumn.make('name').stickable()        // Column sticks on horizontal scroll
TextColumn.make('notes').notStickable()    // Column scrolls normally
```

---

### meta(value)

Attach arbitrary metadata to the column. This metadata is serialized to the frontend and can be accessed in custom cell renderers.

**Signature:** `meta(meta: Record<string, any>): this`

**Parameters:**
| Parameter | Type                   | Description                  |
|-----------|------------------------|------------------------------|
| `meta`    | `Record<string, any>`  | Key-value metadata object    |

**Returns:** `this`

```typescript
TextColumn.make('status').meta({
  tooltip: 'Current account status',
  width: 120,
  priority: 'high',
})

// In the frontend, access via column.meta.tooltip, column.meta.width, etc.
```

---

### mapAs(callback)

Transform the column value before it is sent to the frontend. Accepts either a callback function or a lookup map.

**Signature:** `mapAs(mapAs: MapAsFunction | MapAsMap): this`

**Types:**
```typescript
type MapAsFunction = (value: any, item?: any) => any;
type MapAsMap = Record<string, any>;
```

**Parameters:**
| Parameter | Type                          | Description                          |
|-----------|-------------------------------|--------------------------------------|
| `mapAs`   | `MapAsFunction \| MapAsMap`   | Transformation function or map       |

**Returns:** `this`

**Using a function:**

```typescript
// Format price from cents to dollars
NumericColumn.make('price').mapAs((value) => `$${(value / 100).toFixed(2)}`)

// Access the full item
TextColumn.make('fullName').mapAs((value, item) => `${item.firstName} ${item.lastName}`)
```

**Using a lookup map:**

```typescript
// Map database values to display labels
TextColumn.make('role').mapAs({
  1: 'Admin',
  2: 'Editor',
  3: 'Viewer',
})

// Map status codes
TextColumn.make('status').mapAs({
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending Review',
})
```

When using a map, the column value is used as the key. If the value is not found in the map, `null` is returned.

---

### exportAs(callback) / dontExport()

Customize how the column value is formatted when exported, or exclude it from exports entirely.

**Signatures:**
- `exportAs(exportAs: ((value: any, item?: any) => any) | false): this`
- `dontExport(): this`

**Parameters:**
| Parameter  | Type                                    | Description                           |
|------------|-----------------------------------------|---------------------------------------|
| `exportAs` | `function \| false`                     | Custom export formatter or `false`    |

**Returns:** `this`

```typescript
// Custom export format
NumericColumn.make('price')
  .mapAs((value) => `$${(value / 100).toFixed(2)}`)           // Display: $12.50
  .exportAs((value) => value / 100)                            // Export: 12.50

// Exclude from export
TextColumn.make('internalNotes').dontExport()

// Same as dontExport()
TextColumn.make('internalNotes').exportAs(false)
```

When no `exportAs` is set, the export uses the same value as `mapForTable()`.

---

### sortUsing(callback)

Provide custom sort logic. Instead of using the default `ORDER BY column ASC|DESC`, the callback receives the TypeORM query builder and can apply any sort logic.

**Signature:** `sortUsing(sortUsing: SortUsingFunction): this`

**Type:**
```typescript
type SortUsingFunction = (query: any, direction: string) => void;
```

**Parameters:**
| Parameter   | Type                 | Description                                |
|-------------|----------------------|--------------------------------------------|
| `sortUsing` | `SortUsingFunction`  | Custom sort callback                       |

**Returns:** `this`

```typescript
// Sort by a computed value
NumericColumn.make('priority').sortUsing((qb, direction) => {
  qb.addOrderBy(
    `CASE WHEN priority = 'high' THEN 1 WHEN priority = 'medium' THEN 2 ELSE 3 END`,
    direction.toUpperCase(),
  );
})

// Sort using a related field
TextColumn.make('author').sortUsing((qb, direction) => {
  qb.leftJoin('entity.author', 'author')
    .addOrderBy('author.lastName', direction.toUpperCase());
})
```

---

### Getter Methods

These methods read the current state of the column. They are used internally during serialization and query building.

#### getAttribute()

Returns the attribute name of the column.

**Signature:** `getAttribute(): string`

```typescript
const col = TextColumn.make('user.email');
col.getAttribute(); // 'user.email'
```

---

#### getHeader()

Returns the display header of the column.

**Signature:** `getHeader(): string`

```typescript
const col = TextColumn.make('firstName');
col.getHeader(); // 'First name'

const col2 = TextColumn.make('firstName', 'Full Name');
col2.getHeader(); // 'Full Name'
```

---

#### isSortable()

Returns whether the column is sortable.

**Signature:** `isSortable(): boolean`

```typescript
TextColumn.make('name').isSortable();           // false
TextColumn.make('name').sortable().isSortable(); // true
```

---

#### isSearchable()

Returns whether the column is included in global search.

**Signature:** `isSearchable(): boolean`

```typescript
TextColumn.make('name').isSearchable();             // false
TextColumn.make('name').searchable().isSearchable(); // true
```

---

#### isToggleable()

Returns whether the column can be toggled on/off by the user.

**Signature:** `isToggleable(): boolean`

```typescript
TextColumn.make('name').isToggleable();               // true (default)
TextColumn.make('name').notToggleable().isToggleable(); // false
```

---

#### isVisible()

Returns whether the column is visible by default. A non-toggleable column is always visible.

**Signature:** `isVisible(): boolean`

```typescript
TextColumn.make('name').isVisible();              // true
TextColumn.make('name').hidden().isVisible();     // false (toggleable + hidden)
TextColumn.make('name').notToggleable().hidden().isVisible(); // true (not toggleable overrides)
```

---

#### isStickable()

Returns whether the column is stickable.

**Signature:** `isStickable(): boolean`

```typescript
TextColumn.make('name').isStickable();             // false (default)
TextColumn.make('name').stickable().isStickable(); // true
```

---

#### shouldBeExported()

Returns whether the column should be included in exports.

**Signature:** `shouldBeExported(): boolean`

```typescript
TextColumn.make('name').shouldBeExported();             // true (default)
TextColumn.make('name').dontExport().shouldBeExported(); // false
ActionColumn.make().shouldBeExported();                  // false (always)
```

---

#### getSortUsing()

Returns the custom sort function, or `null` if none is set.

**Signature:** `getSortUsing(): SortUsingFunction | null`

---

### Relationship Methods

These methods support columns that reference data from related entities using dot notation (e.g., `'department.name'`).

#### isNested()

Returns `true` if the attribute contains a dot (indicating a relationship), excluding `pivot.` prefixed attributes.

**Signature:** `isNested(): boolean`

```typescript
TextColumn.make('name').isNested();            // false
TextColumn.make('department.name').isNested();  // true
TextColumn.make('pivot.rank').isNested();       // false
```

---

#### getRelationshipName()

Returns the relationship name (everything before the last dot).

**Signature:** `getRelationshipName(): string`

```typescript
TextColumn.make('department.name').getRelationshipName();       // 'department'
TextColumn.make('company.department.name').getRelationshipName(); // 'company.department'
```

---

#### getRelationshipColumn()

Returns the column name on the related entity (everything after the last dot).

**Signature:** `getRelationshipColumn(): string`

```typescript
TextColumn.make('department.name').getRelationshipColumn(); // 'name'
```

---

### Value Methods

These methods handle extracting and transforming data from entity instances.

#### getDataFromItem(item)

Extracts the value for this column from an entity/item, supporting nested dot-notation paths.

**Signature:** `getDataFromItem(item: any): any`

```typescript
const col = TextColumn.make('department.name');
const item = { department: { name: 'Engineering' } };
col.getDataFromItem(item); // 'Engineering'

const col2 = TextColumn.make('name');
const item2 = { name: 'Alice' };
col2.getDataFromItem(item2); // 'Alice'
```

---

#### mapValue(value, item?)

The base value transformation. Called by `mapForTable` when no custom `mapAs` is set. The base `Column` class returns the value unchanged. Subclasses override this to provide type-specific formatting (e.g., `DateColumn` formats the date, `BooleanColumn` returns the label).

**Signature:** `mapValue(value: any, item?: any): any`

---

#### mapForTable(value, item?)

Transforms a raw value for table display. If `mapAs` is set (function or map), it uses that. Otherwise, it falls back to `mapValue`.

**Signature:** `mapForTable(value: any, item?: any): any`

```typescript
// With mapAs function:
const col = TextColumn.make('name').mapAs((v) => v.toUpperCase());
col.mapForTable('alice'); // 'ALICE'

// With mapAs map:
const col2 = TextColumn.make('status').mapAs({ active: 'Active', inactive: 'Inactive' });
col2.mapForTable('active'); // 'Active'

// Without mapAs (uses mapValue):
const col3 = TextColumn.make('name');
col3.mapForTable('alice'); // 'alice'
```

---

#### mapForExport(value, item?)

Transforms a raw value for export. If `exportAs` is set, it uses that. Otherwise, it falls back to `mapForTable`.

**Signature:** `mapForExport(value: any, item?: any): any`

```typescript
const col = NumericColumn.make('price')
  .mapAs((v) => `$${v}`)       // Table display: $100
  .exportAs((v) => v);          // Export: 100

col.mapForTable(100);   // '$100'
col.mapForExport(100);  // 100
```

---

### toArray()

Serializes the column to a plain object for sending to the frontend.

**Signature:** `toArray(): ColumnSerialized`

**Returns:**

```typescript
interface ColumnSerialized {
  type: string;
  key: string;           // getAttribute()
  header: string;        // getHeader()
  sortable: boolean;
  searchable: boolean;
  toggleable: boolean;
  visible: boolean;
  alignment: ColumnAlignment;
  wrap: boolean;
  truncate: number | false;
  headerClass: string | null;
  cellClass: string | null;
  stickable: boolean;
  meta: Record<string, any> | null;
  // ... additional properties from subclasses
}
```

```typescript
const col = TextColumn.make('name')
  .sortable()
  .searchable()
  .headerClass('font-bold');

col.toArray();
// {
//   type: 'text',
//   key: 'name',
//   header: 'Name',
//   sortable: true,
//   searchable: true,
//   toggleable: true,
//   visible: true,
//   alignment: 'left',
//   wrap: false,
//   truncate: false,
//   headerClass: 'font-bold',
//   cellClass: null,
//   stickable: false,
//   meta: null,
// }
```

---

## TextColumn

A plain text column with no extra methods.

**Type string:** `'text'`

```typescript
import { TextColumn } from '@kkmodules/nestjs-table';

TextColumn.make('name')
TextColumn.make('name', 'Full Name')
```

### Full Example

```typescript
TextColumn.make('name')
  .sortable()
  .searchable()
  .wrap()
  .truncate(2)
  .headerClass('min-w-[200px]')
  .cellClass('font-medium')
  .meta({ tooltip: 'The user display name' })
```

---

## NumericColumn

A column for numeric values. No extra methods beyond the base `Column` -- formatting is done via `mapAs()`.

**Type string:** `'numeric'`

```typescript
import { NumericColumn } from '@kkmodules/nestjs-table';

NumericColumn.make('age')
NumericColumn.make('price', 'Unit Price')
```

### Full Example

```typescript
// Display price formatted as currency, export as raw number
NumericColumn.make('price', 'Price')
  .sortable()
  .rightAligned()
  .mapAs((value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value / 100);
  })
  .exportAs((value) => value / 100)
  .cellClass('tabular-nums')
```

```typescript
// Simple integer column
NumericColumn.make('stock', 'Stock Qty')
  .sortable()
  .centerAligned()
```

```typescript
// Percentage column
NumericColumn.make('completionRate', 'Progress')
  .mapAs((value) => `${value}%`)
  .rightAligned()
```

---

## DateColumn

A column for date values with a configurable format string. Dates are formatted using a simple token replacement system.

**Type string:** `'date'`

```typescript
import { DateColumn } from '@kkmodules/nestjs-table';

DateColumn.make('birthDate')
DateColumn.make('releaseDate', 'Released On')
```

### Extra Methods

#### format(format)

Set the date format string for this column.

**Signature:** `format(format: string): this`

**Parameters:**
| Parameter | Type     | Description                  |
|-----------|----------|------------------------------|
| `format`  | `string` | Date format pattern          |

**Returns:** `this`

**Supported tokens:**
| Token  | Description       | Example  |
|--------|-------------------|----------|
| `YYYY` | 4-digit year      | `2024`   |
| `MM`   | 2-digit month     | `01`-`12`|
| `DD`   | 2-digit day       | `01`-`31`|

```typescript
DateColumn.make('birthDate').format('MM/DD/YYYY')   // 01/15/2024
DateColumn.make('birthDate').format('DD-MM-YYYY')   // 15-01-2024
DateColumn.make('birthDate').format('YYYY-MM-DD')   // 2024-01-15
```

---

#### getFormat()

Returns the active format string: the instance format if set, otherwise the static default, otherwise `'YYYY-MM-DD'`.

**Signature:** `getFormat(): string`

```typescript
const col = DateColumn.make('date');
col.getFormat(); // 'YYYY-MM-DD'

col.format('MM/DD/YYYY');
col.getFormat(); // 'MM/DD/YYYY'
```

---

#### static setDefaultFormat(format)

Set the default format for all `DateColumn` instances. This is a class-level setting.

**Signature:** `static setDefaultFormat(format: string): void`

```typescript
// In your app bootstrap
DateColumn.setDefaultFormat('DD/MM/YYYY');

// Now all DateColumns without an explicit format use DD/MM/YYYY
DateColumn.make('date').getFormat(); // 'DD/MM/YYYY'
```

---

### mapValue Behavior

When no `mapAs` is set, `DateColumn.mapValue` parses the value as a `Date` and formats it using the configured format. Returns `null` for falsy or invalid date values.

```typescript
const col = DateColumn.make('date').format('YYYY-MM-DD');
col.mapForTable('2024-06-15T10:30:00Z'); // '2024-06-15'
col.mapForTable(null);                    // null
col.mapForTable('invalid');               // null
```

### Full Example

```typescript
DateColumn.make('hireDate', 'Hire Date')
  .sortable()
  .format('MM/DD/YYYY')
  .cellClass('text-muted-foreground')
```

---

## DateTimeColumn

A column for date and time values. Works the same as `DateColumn` but with a default format that includes hours, minutes, and seconds.

**Type string:** `'datetime'`

```typescript
import { DateTimeColumn } from '@kkmodules/nestjs-table';

DateTimeColumn.make('createdAt')
DateTimeColumn.make('lastLoginAt', 'Last Login')
```

### Extra Methods

#### format(format)

Set the datetime format string for this column.

**Signature:** `format(format: string): this`

**Supported tokens:**
| Token  | Description       | Example    |
|--------|-------------------|------------|
| `YYYY` | 4-digit year      | `2024`     |
| `MM`   | 2-digit month     | `01`-`12`  |
| `DD`   | 2-digit day       | `01`-`31`  |
| `HH`   | 2-digit hour (24h)| `00`-`23`  |
| `mm`   | 2-digit minute    | `00`-`59`  |
| `ss`   | 2-digit second    | `00`-`59`  |

```typescript
DateTimeColumn.make('createdAt').format('YYYY-MM-DD HH:mm')    // 2024-01-15 14:30
DateTimeColumn.make('createdAt').format('MM/DD/YYYY HH:mm:ss') // 01/15/2024 14:30:45
DateTimeColumn.make('createdAt').format('DD-MM-YYYY HH:mm')    // 15-01-2024 14:30
```

---

#### getFormat()

Returns the active format string: the instance format if set, otherwise the static default, otherwise `'YYYY-MM-DD HH:mm:ss'`.

**Signature:** `getFormat(): string`

```typescript
const col = DateTimeColumn.make('date');
col.getFormat(); // 'YYYY-MM-DD HH:mm:ss'
```

---

#### static setDefaultFormat(format)

Set the default format for all `DateTimeColumn` instances.

**Signature:** `static setDefaultFormat(format: string): void`

```typescript
DateTimeColumn.setDefaultFormat('DD/MM/YYYY HH:mm');

DateTimeColumn.make('date').getFormat(); // 'DD/MM/YYYY HH:mm'
```

---

### mapValue Behavior

Same as `DateColumn` but with time tokens. Returns `null` for falsy or invalid date values.

```typescript
const col = DateTimeColumn.make('createdAt').format('YYYY-MM-DD HH:mm');
col.mapForTable('2024-06-15T14:30:45Z'); // '2024-06-15 14:30'
```

### Full Example

```typescript
DateTimeColumn.make('createdAt', 'Created')
  .sortable()
  .format('YYYY-MM-DD HH:mm')
  .cellClass('text-sm text-muted-foreground whitespace-nowrap')
```

---

## BooleanColumn

A column for boolean (true/false) values with configurable labels and icons.

**Type string:** `'boolean'`

```typescript
import { BooleanColumn } from '@kkmodules/nestjs-table';

BooleanColumn.make('isActive')
BooleanColumn.make('isVerified', 'Verified')
```

### Extra Methods

#### trueLabel(label)

Set the text label displayed when the value is `true`.

**Signature:** `trueLabel(label: string): this`

```typescript
BooleanColumn.make('isActive').trueLabel('Active')
```

---

#### falseLabel(label)

Set the text label displayed when the value is `false`.

**Signature:** `falseLabel(label: string): this`

```typescript
BooleanColumn.make('isActive').falseLabel('Inactive')
```

---

#### trueIcon(icon)

Set the icon displayed when the value is `true`. When a true icon is set, the frontend renders the icon instead of the text label.

**Signature:** `trueIcon(icon: string): this`

```typescript
BooleanColumn.make('isActive').trueIcon('check')
```

---

#### falseIcon(icon)

Set the icon displayed when the value is `false`. When a false icon is set, the frontend renders the icon instead of the text label.

**Signature:** `falseIcon(icon: string): this`

```typescript
BooleanColumn.make('isActive').falseIcon('x')
```

---

#### getTrueLabel() / getFalseLabel()

Get the resolved label for true/false. Returns the instance label if set, otherwise the static default, otherwise `'Yes'`/`'No'`.

**Signatures:**
- `getTrueLabel(): string`
- `getFalseLabel(): string`

```typescript
const col = BooleanColumn.make('active');
col.getTrueLabel();  // 'Yes' (default)
col.getFalseLabel(); // 'No' (default)

col.trueLabel('Enabled').falseLabel('Disabled');
col.getTrueLabel();  // 'Enabled'
col.getFalseLabel(); // 'Disabled'
```

---

#### getTrueIcon() / getFalseIcon()

Get the resolved icon for true/false. Returns the instance icon if set, otherwise the static default, otherwise `null`.

**Signatures:**
- `getTrueIcon(): string | null`
- `getFalseIcon(): string | null`

```typescript
const col = BooleanColumn.make('active');
col.getTrueIcon();  // null (default)
col.getFalseIcon(); // null (default)

col.trueIcon('check').falseIcon('x');
col.getTrueIcon();  // 'check'
col.getFalseIcon(); // 'x'
```

---

#### static setDefaultTrueLabel(label)

Set the default true label for all `BooleanColumn` instances.

**Signature:** `static setDefaultTrueLabel(label: string): void`

```typescript
BooleanColumn.setDefaultTrueLabel('Active');
```

---

#### static setDefaultFalseLabel(label)

Set the default false label for all `BooleanColumn` instances.

**Signature:** `static setDefaultFalseLabel(label: string): void`

```typescript
BooleanColumn.setDefaultFalseLabel('Inactive');
```

---

#### static setDefaultTrueIcon(icon)

Set the default true icon for all `BooleanColumn` instances.

**Signature:** `static setDefaultTrueIcon(icon: string | null): void`

```typescript
BooleanColumn.setDefaultTrueIcon('check-circle');
```

---

#### static setDefaultFalseIcon(icon)

Set the default false icon for all `BooleanColumn` instances.

**Signature:** `static setDefaultFalseIcon(icon: string | null): void`

```typescript
BooleanColumn.setDefaultFalseIcon('x-circle');
```

---

### mapForTable Behavior

The `mapForTable` method has special logic for icons:

1. If the value is `true` **and** a true icon is configured, it returns `true` (the boolean). The frontend renders the icon.
2. If the value is `false` **and** a false icon is configured, it returns `false` (the boolean). The frontend renders the icon.
3. Otherwise, it falls back to `mapValue` which returns the true/false label string.

```typescript
// With icons
const col = BooleanColumn.make('active').trueIcon('check').falseIcon('x');
col.mapForTable(true);   // true  (frontend shows check icon)
col.mapForTable(false);  // false (frontend shows x icon)

// Without icons
const col2 = BooleanColumn.make('active').trueLabel('Yes').falseLabel('No');
col2.mapForTable(true);  // 'Yes'
col2.mapForTable(false); // 'No'
```

### toArray Output

The serialized output includes `trueIcon`, `falseIcon`, `trueLabel`, and `falseLabel`:

```typescript
BooleanColumn.make('active')
  .trueLabel('Active')
  .falseLabel('Inactive')
  .trueIcon('check')
  .falseIcon('x')
  .toArray();

// {
//   type: 'boolean',
//   key: 'active',
//   header: 'Active',
//   ...baseFields,
//   trueIcon: 'check',
//   falseIcon: 'x',
//   trueLabel: 'Active',
//   falseLabel: 'Inactive',
// }
```

### Full Example

```typescript
BooleanColumn.make('isVerified', 'Verified')
  .centerAligned()
  .trueLabel('Verified')
  .falseLabel('Unverified')
  .trueIcon('shield-check')
  .falseIcon('shield-x')
```

---

## BadgeColumn

A column that renders values as styled badges. Badges can have a variant (color scheme) and an optional icon, both resolved dynamically based on the cell value.

**Type string:** `'badge'`

```typescript
import { BadgeColumn } from '@kkmodules/nestjs-table';

BadgeColumn.make('status')
BadgeColumn.make('priority', 'Priority Level')
```

### Extra Methods

#### variant(resolver)

Set a resolver that determines the badge variant (visual style) based on the cell value. Accepts either a map object or a function.

**Signature:** `variant(resolver: VariantResolver): this`

**Types:**
```typescript
type VariantResolver =
  | Record<string, string>
  | ((value: any, item?: any) => string);
```

**Parameters:**
| Parameter  | Type              | Description                                  |
|------------|-------------------|----------------------------------------------|
| `resolver` | `VariantResolver` | A map or function that resolves the variant  |

**Returns:** `this`

**Using a map:**

```typescript
BadgeColumn.make('status').variant({
  active: 'success',
  inactive: 'destructive',
  pending: 'warning',
  draft: 'secondary',
})
```

The map keys are matched against the raw cell value. The values should be variant names recognized by the frontend badge component. Available variants from the `Variant` enum:

| Variant          | String           | Typical Appearance          |
|------------------|------------------|-----------------------------|
| `Default`        | `'default'`      | Neutral/gray                |
| `Info`           | `'info'`         | Blue/informational          |
| `Success`        | `'success'`      | Green/positive              |
| `Warning`        | `'warning'`      | Yellow/amber                |
| `Destructive`    | `'destructive'`  | Red/danger                  |
| `Secondary`      | `'secondary'`    | Muted/gray                  |
| `Outline`        | `'outline'`      | Bordered, no fill           |
| `Ghost`          | `'ghost'`        | Minimal/transparent         |
| `Link`           | `'link'`         | Styled as a link            |

**Using a function:**

```typescript
BadgeColumn.make('score').variant((value, item) => {
  if (value >= 90) return 'success';
  if (value >= 70) return 'warning';
  return 'destructive';
})
```

The function receives the raw cell value and the full item object. It should return a variant string.

---

#### icon(resolver)

Set a resolver that determines the badge icon based on the cell value. Accepts either a map object or a function.

**Signature:** `icon(resolver: IconResolver): this`

**Types:**
```typescript
type IconResolver =
  | Record<string, string>
  | ((value: any, item?: any) => string | null);
```

**Parameters:**
| Parameter  | Type            | Description                              |
|------------|-----------------|------------------------------------------|
| `resolver` | `IconResolver`  | A map or function that resolves the icon |

**Returns:** `this`

**Using a map:**

```typescript
BadgeColumn.make('status').icon({
  active: 'check-circle',
  inactive: 'x-circle',
  pending: 'clock',
})
```

**Using a function:**

```typescript
BadgeColumn.make('status').icon((value) => {
  const icons: Record<string, string> = {
    active: 'check-circle',
    inactive: 'x-circle',
    pending: 'clock',
  };
  return icons[value] ?? null;
})
```

---

### mapForTable Behavior

`BadgeColumn.mapForTable` returns an enriched object (not a raw value):

```typescript
{
  value: string | null;    // The display value (from mapAs or mapValue)
  variant: string | null;  // The resolved variant
  icon: string | null;     // The resolved icon
}
```

The frontend badge component uses all three fields to render the badge.

```typescript
const col = BadgeColumn.make('status')
  .variant({ active: 'success', inactive: 'destructive' })
  .icon({ active: 'check', inactive: 'x' })
  .mapAs({ active: 'Active', inactive: 'Inactive' });

col.mapForTable('active');
// { value: 'Active', variant: 'success', icon: 'check' }

col.mapForTable('inactive');
// { value: 'Inactive', variant: 'destructive', icon: 'x' }
```

### mapForExport Behavior

Exports use the plain value (not the badge object). If `exportAs` is set, it uses that. Otherwise, it falls back to the base `mapForTable` (which applies `mapAs` or `mapValue` without badge wrapping).

```typescript
const col = BadgeColumn.make('status')
  .mapAs({ active: 'Active', inactive: 'Inactive' });

col.mapForExport('active'); // 'Active' (not the badge object)
```

### Full Example

```typescript
BadgeColumn.make('status', 'Status')
  .variant({
    active: 'success',
    inactive: 'destructive',
    pending: 'warning',
    review: 'info',
    draft: 'secondary',
  })
  .icon({
    active: 'check-circle',
    inactive: 'x-circle',
    pending: 'clock',
    review: 'eye',
    draft: 'file-edit',
  })
  .mapAs({
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    review: 'In Review',
    draft: 'Draft',
  })
  .centerAligned()
```

**Example with a function resolver:**

```typescript
BadgeColumn.make('temperature', 'Temp')
  .variant((value) => {
    if (value > 100) return 'destructive';
    if (value > 80) return 'warning';
    return 'success';
  })
  .icon((value) => {
    if (value > 100) return 'flame';
    if (value > 80) return 'thermometer';
    return 'snowflake';
  })
  .mapAs((value) => `${value} F`)
```

---

## ImageColumn

A column that displays an image thumbnail. The column value should be an image URL string.

**Type string:** `'image'`

```typescript
import { ImageColumn } from '@kkmodules/nestjs-table';

ImageColumn.make('avatarUrl')
ImageColumn.make('thumbnailUrl', 'Photo')
```

### Extra Methods

#### size(size)

Set the image display size.

**Signature:** `size(size: ImageSize): this`

**Parameters:**
| Parameter | Type        | Description        |
|-----------|-------------|--------------------|
| `size`    | `ImageSize` | The display size   |

**Returns:** `this`

**ImageSize enum:**

| Value                     | String           | Description                     |
|---------------------------|------------------|---------------------------------|
| `ImageSize.Small`        | `'small'`        | Small thumbnail                 |
| `ImageSize.Medium`       | `'medium'`       | Medium thumbnail (default)      |
| `ImageSize.Large`        | `'large'`        | Large thumbnail                 |
| `ImageSize.ExtraLarge`   | `'extra-large'`  | Extra large thumbnail           |
| `ImageSize.Custom`       | `'custom'`       | Custom width/height             |

```typescript
import { ImageSize } from '@kkmodules/nestjs-table';

ImageColumn.make('avatar').size(ImageSize.Small)
ImageColumn.make('avatar').size(ImageSize.Large)
ImageColumn.make('avatar').size(ImageSize.ExtraLarge)
```

---

#### position(position)

Set the image position within the cell.

**Signature:** `position(position: ImagePosition): this`

**Parameters:**
| Parameter  | Type            | Description            |
|------------|-----------------|------------------------|
| `position` | `ImagePosition` | The image position     |

**Returns:** `this`

**ImagePosition enum:**

| Value                     | String    | Description                                |
|---------------------------|-----------|--------------------------------------------|
| `ImagePosition.Start`    | `'start'` | Image appears before the text (default)    |
| `ImagePosition.End`      | `'end'`   | Image appears after the text               |

```typescript
import { ImagePosition } from '@kkmodules/nestjs-table';

ImageColumn.make('avatar').position(ImagePosition.Start) // Image on left
ImageColumn.make('avatar').position(ImagePosition.End)   // Image on right
```

---

#### fallback(url)

Set a fallback image URL displayed when the column value is empty or the image fails to load.

**Signature:** `fallback(url: string | null): this`

**Parameters:**
| Parameter | Type             | Description              |
|-----------|------------------|--------------------------|
| `url`     | `string \| null` | Fallback image URL       |

**Returns:** `this`

```typescript
ImageColumn.make('avatar').fallback('/images/default-avatar.png')
ImageColumn.make('productImage').fallback(null) // No fallback
```

---

#### rounded(value?)

Set whether the image should have rounded corners (typically rendered as a circle).

**Signature:** `rounded(rounded: boolean = true): this`

**Parameters:**
| Parameter | Type      | Default | Description                    |
|-----------|-----------|---------|--------------------------------|
| `rounded` | `boolean` | `true`  | Whether to apply rounding      |

**Returns:** `this`

```typescript
ImageColumn.make('avatar').rounded()        // Circular image
ImageColumn.make('avatar').rounded(true)    // Circular image
ImageColumn.make('avatar').rounded(false)   // Square/rectangular image
```

---

### toArray Output

The serialized output includes image-specific fields:

```typescript
ImageColumn.make('avatar')
  .size(ImageSize.Small)
  .position(ImagePosition.Start)
  .fallback('/default.png')
  .rounded()
  .toArray();

// {
//   type: 'image',
//   key: 'avatar',
//   header: 'Avatar',
//   ...baseFields,
//   imageSize: 'small',
//   imagePosition: 'start',
//   fallbackImage: '/default.png',
//   rounded: true,
// }
```

### Full Example

```typescript
ImageColumn.make('avatarUrl', 'Avatar')
  .size(ImageSize.Small)
  .position(ImagePosition.Start)
  .fallback('/images/default-avatar.png')
  .rounded()
  .notSortable()
  .notToggleable()
  .notSearchable()
  .dontExport()
```

---

## ActionColumn

A special column that renders row action buttons (edit, delete, etc.). It has a fixed attribute of `'_actions'` and is always excluded from exports.

**Type string:** `'action'`

```typescript
import { ActionColumn } from '@kkmodules/nestjs-table';

ActionColumn.make()
ActionColumn.make('Actions')
```

### Overridden make()

The `ActionColumn.make()` factory has a different signature than the base `Column.make()`.

**Signature:** `static make(header?: string): ActionColumn`

**Parameters:**
| Parameter | Type     | Required | Default | Description                    |
|-----------|----------|----------|---------|--------------------------------|
| `header`  | `string` | No       | `''`    | Column header label            |

**Returns:** `ActionColumn`

Unlike other columns, `ActionColumn.make()`:
- Does not accept an `attribute` parameter -- the attribute is always `'_actions'`
- Sets alignment to `ColumnAlignment.Right`
- Sets `toggleable` to `false` (cannot be hidden)
- Sets `shouldExport` to `false` (never exported)

```typescript
ActionColumn.make()                    // No header text
ActionColumn.make('Actions')           // With header text
ActionColumn.make('Manage')            // Custom header
```

---

### Extra Methods

#### asDropdown(value?)

Set whether the row actions should be rendered as a dropdown menu instead of inline buttons.

**Signature:** `asDropdown(value: boolean = true): this`

**Parameters:**
| Parameter | Type      | Default | Description                        |
|-----------|-----------|---------|------------------------------------|
| `value`   | `boolean` | `true`  | Whether to use dropdown rendering  |

**Returns:** `this`

```typescript
ActionColumn.make().asDropdown()        // Render actions in a dropdown menu
ActionColumn.make().asDropdown(false)   // Render actions as inline buttons
```

---

#### static defaultAsDropdown(value)

Set the default dropdown behavior for all `ActionColumn` instances.

**Signature:** `static defaultAsDropdown(value: boolean = true): void`

```typescript
// In your app bootstrap
ActionColumn.defaultAsDropdown(true);

// Now all ActionColumns use dropdown by default
ActionColumn.make(); // Will use dropdown
```

---

### Fixed Behaviors

These behaviors are hardcoded and cannot be changed:

| Behavior             | Value               | Description                                    |
|----------------------|---------------------|------------------------------------------------|
| `getAttribute()`    | `'_actions'`        | Always returns `'_actions'`                    |
| `shouldBeExported()` | `false`             | Action columns are never exported              |
| `toggleable`         | `false`             | Action columns cannot be hidden by the user    |
| `alignment`          | `ColumnAlignment.Right` | Right-aligned by default                   |

---

### toArray Output

```typescript
ActionColumn.make('Actions').asDropdown().toArray();

// {
//   type: 'action',
//   key: '_actions',
//   header: 'Actions',
//   sortable: false,
//   searchable: false,
//   toggleable: false,
//   visible: true,
//   alignment: 'right',
//   wrap: false,
//   truncate: false,
//   headerClass: null,
//   cellClass: null,
//   stickable: false,
//   meta: null,
//   asDropdown: true,
// }
```

### Full Example

```typescript
// In your columns() method:
columns() {
  return [
    TextColumn.make('name').sortable().searchable(),
    TextColumn.make('email').sortable().searchable(),
    DateTimeColumn.make('createdAt').sortable(),
    ActionColumn.make().asDropdown(),
  ];
}

// The actions themselves are defined in actions():
actions() {
  return [
    Action.make('view', 'View')
      .asLink()
      .icon('eye')
      .url((row) => `/users/${row.id}`),
    Action.make('edit', 'Edit')
      .asLink()
      .icon('pencil')
      .url((row) => `/users/${row.id}/edit`),
    Action.make('delete', 'Delete')
      .asButton()
      .variant(Variant.Destructive)
      .icon('trash')
      .confirm({ title: 'Delete this user?' })
      .handle(async (item, repo) => {
        await repo.softDelete(item.id);
      }),
  ];
}
```

---

## Method Chaining Reference

All column methods return `this`, enabling fluent method chaining:

```typescript
TextColumn.make('name')
  .sortable()
  .searchable()
  .toggleable()
  .visible()
  .leftAligned()
  .wrap()
  .truncate(2)
  .headerClass('font-bold')
  .cellClass('text-blue-600')
  .stickable()
  .meta({ tooltip: 'User name' })
  .mapAs((value) => value.toUpperCase())
  .exportAs((value) => value)
```

---

## Setting Global Defaults

Several column types support static methods for setting defaults across all instances. Call these in your application bootstrap (e.g., in a NestJS provider or module initializer):

```typescript
// Date/DateTime formats
DateColumn.setDefaultFormat('DD/MM/YYYY');
DateTimeColumn.setDefaultFormat('DD/MM/YYYY HH:mm');

// Boolean labels and icons
BooleanColumn.setDefaultTrueLabel('Active');
BooleanColumn.setDefaultFalseLabel('Inactive');
BooleanColumn.setDefaultTrueIcon('check-circle');
BooleanColumn.setDefaultFalseIcon('x-circle');

// Action column dropdown
ActionColumn.defaultAsDropdown(true);
```

---

## Next Steps

- [Table Configuration](./table-configuration.md) -- Learn about `@TableConfig` options and `BaseTable` methods
- [Getting Started](./getting-started.md) -- Installation and initial setup
