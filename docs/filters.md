# Filters

Filters allow users to narrow down table data based on column values. Each filter type provides a specific set of **clauses** (comparison operators), validation logic, and SQL generation. Filters are defined in your table class by overriding the `filters()` method.

```ts
import { TextFilter, NumericFilter, DateFilter, BooleanFilter, SetFilter } from '@nestjs-table-module/backend';

class UsersTable extends BaseTable<User> {
  filters() {
    return [
      TextFilter.make('name'),
      TextFilter.make('email'),
      NumericFilter.make('age'),
      DateFilter.make('createdAt'),
      BooleanFilter.make('isActive'),
      SetFilter.make('status').options([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]),
    ];
  }
}
```

---

## Table of Contents

- [Clause Reference](#clause-reference)
- [Helper Functions](#helper-functions)
- [Base Filter (abstract)](#base-filter)
- [TextFilter](#textfilter)
- [NumericFilter](#numericfilter)
- [DateFilter](#datefilter)
- [BooleanFilter](#booleanfilter)
- [SetFilter](#setfilter)
- [TrashedFilter](#trashedfilter)
- [Nested / Relationship Filters](#nested--relationship-filters)
- [Frontend Integration](#frontend-integration)

---

## Clause Reference

All clauses are defined in the `Clause` enum and categorized by domain. Each clause represents a comparison operator that the filter can apply to its attribute.

| Clause | Enum Value | Category | Description | SQL Equivalent |
|---|---|---|---|---|
| `Clause.Equals` | `'equals'` | Text / Numeric / Date | Exact match | `attribute = :value` |
| `Clause.NotEquals` | `'not_equals'` | Text / Numeric / Date | Not equal | `attribute != :value` |
| `Clause.Contains` | `'contains'` | Text | Substring match (case-insensitive) | `attribute ILIKE '%value%'` |
| `Clause.NotContains` | `'not_contains'` | Text | Substring exclusion | `attribute NOT ILIKE '%value%'` |
| `Clause.StartsWith` | `'starts_with'` | Text | Prefix match (case-insensitive) | `attribute ILIKE 'value%'` |
| `Clause.EndsWith` | `'ends_with'` | Text | Suffix match (case-insensitive) | `attribute ILIKE '%value'` |
| `Clause.NotStartsWith` | `'not_starts_with'` | Text | Prefix exclusion | `attribute NOT ILIKE 'value%'` |
| `Clause.NotEndsWith` | `'not_ends_with'` | Text | Suffix exclusion | `attribute NOT ILIKE '%value'` |
| `Clause.IsTrue` | `'is_true'` | Boolean | Value is true | `attribute = true` |
| `Clause.IsFalse` | `'is_false'` | Boolean | Value is false | `attribute = false` |
| `Clause.IsSet` | `'is_set'` | Boolean (nullable) | Value is not null | `attribute IS NOT NULL` |
| `Clause.IsNotSet` | `'is_not_set'` | Boolean (nullable) | Value is null | `attribute IS NULL` |
| `Clause.Before` | `'before'` | Date | Strictly before a date | `attribute < :value` |
| `Clause.After` | `'after'` | Date | Strictly after a date | `attribute > :value` |
| `Clause.EqualOrBefore` | `'equal_or_before'` | Date | On or before a date | `attribute <= :value` |
| `Clause.EqualOrAfter` | `'equal_or_after'` | Date | On or after a date | `attribute >= :value` |
| `Clause.Between` | `'between'` | Date / Numeric | Within a range (inclusive) | `attribute BETWEEN :min AND :max` |
| `Clause.NotBetween` | `'not_between'` | Date / Numeric | Outside a range | `attribute NOT BETWEEN :min AND :max` |
| `Clause.GreaterThan` | `'greater_than'` | Numeric | Greater than | `attribute > :value` |
| `Clause.GreaterThanOrEqual` | `'greater_than_or_equal'` | Numeric | Greater than or equal | `attribute >= :value` |
| `Clause.LessThan` | `'less_than'` | Numeric | Less than | `attribute < :value` |
| `Clause.LessThanOrEqual` | `'less_than_or_equal'` | Numeric | Less than or equal | `attribute <= :value` |
| `Clause.In` | `'in'` | Set | Value is in a list | `attribute IN (:...values)` |
| `Clause.NotIn` | `'not_in'` | Set | Value is not in a list | `attribute NOT IN (:...values)` |
| `Clause.WithTrashed` | `'with_trashed'` | Trashed | Include soft-deleted records | `qb.withDeleted()` |
| `Clause.OnlyTrashed` | `'only_trashed'` | Trashed | Only soft-deleted records | `qb.withDeleted()` + `deletedAt IS NOT NULL` |
| `Clause.WithoutTrashed` | `'without_trashed'` | Trashed | Exclude soft-deleted records | Default TypeORM behavior |

---

## Helper Functions

Two utility functions are exported alongside the `Clause` enum for programmatic clause classification.

### `isNegatedClause(clause: Clause): boolean`

Returns `true` if the clause is a negation variant:

- `Clause.NotEquals`
- `Clause.NotStartsWith`
- `Clause.NotEndsWith`
- `Clause.NotContains`
- `Clause.NotBetween`
- `Clause.NotIn`

### `isWithoutComparisonClause(clause: Clause): boolean`

Returns `true` if the clause does not require a comparison value (i.e., it is a unary operator):

- `Clause.IsTrue`
- `Clause.IsFalse`
- `Clause.IsSet`
- `Clause.IsNotSet`
- `Clause.WithTrashed`
- `Clause.OnlyTrashed`
- `Clause.WithoutTrashed`

This is used internally by `TableQueryService` to skip validation for clauses that don't need a value.

---

## Base Filter

`Filter` is the abstract base class that all filter types extend. It provides shared builder methods, serialization, and the `handle()` dispatch logic.

### Abstract Properties

| Property | Type | Description |
|---|---|---|
| `type` | `string` (readonly) | Filter type identifier (e.g., `'text'`, `'numeric'`, `'date'`, `'boolean'`, `'set'`) |

### Abstract Methods

| Method | Signature | Description |
|---|---|---|
| `defaultClauses()` | `() => Clause[]` | Returns the default set of clauses for this filter type |
| `apply()` | `(qb, attribute, clause, value) => void` | Applies the filter to a TypeORM `SelectQueryBuilder` |
| `validate()` | `(value, clause) => any` | Validates and coerces the incoming filter value; returns `null` to reject |

### Factory

```ts
static make(attribute: string, label?: string): FilterSubclass
```

Creates a new filter instance. The `attribute` is the entity property name (e.g., `'name'`, `'createdAt'`, `'department.name'`). If `label` is omitted, it is auto-generated from the attribute:

- `'created_at'` becomes `'Created at'`
- `'department.name'` becomes `'Name'` (uses the last segment)
- `'firstName'` becomes `'First name'` (splits on camelCase)

### Builder Methods

All builder methods return `this` for chaining.

#### `clauses(clauses: Clause[]): this`

Override the default set of available clauses for this filter.

```ts
TextFilter.make('email').clauses([Clause.Equals, Clause.Contains])
```

#### `nullable(): this`

Appends `Clause.IsSet` and `Clause.IsNotSet` to the filter's clause list. This enables null-checking for columns that may have null values.

```ts
TextFilter.make('nickname').nullable()
// Adds IsSet / IsNotSet to the text filter's clause list
```

#### `default(value: any, clause?: Clause): this`

Sets a default filter value that is applied when the table first loads (before the user interacts with filters). If `clause` is omitted, the first clause in the filter's clause list is used.

```ts
SetFilter.make('status')
  .options({ active: 'Active', inactive: 'Inactive' })
  .default('active', Clause.Equals)
```

#### `applyUsing(callback: ApplyUsingFunction): this`

Replaces the standard `apply()` logic with a custom callback. The callback receives the query builder, attribute name, clause, and value. This is useful for filters that need custom SQL or non-standard application logic.

```ts
type ApplyUsingFunction = (
  qb: any,
  attribute: string,
  clause: Clause,
  value: any,
) => void;
```

```ts
TextFilter.make('fullName').applyUsing((qb, attr, clause, value) => {
  qb.andWhere(`CONCAT(entity.firstName, ' ', entity.lastName) ILIKE :name`, {
    name: `%${value}%`,
  });
})
```

#### `hidden(value?: boolean): this`

Hides the filter from the frontend UI. Hidden filters can still be applied programmatically or via default values. Defaults to `true` when called without arguments.

```ts
TextFilter.make('internalCode').hidden()
```

### Getter Methods

| Method | Return Type | Description |
|---|---|---|
| `getAttribute()` | `string` | The entity attribute this filter targets |
| `getLabel()` | `string` | The human-readable label (auto-generated or explicit) |
| `getClauses()` | `Clause[]` | The active clause list (custom or default) |
| `hasDefaultValue()` | `boolean` | Whether a default value has been set |
| `getDefaultValue()` | `any` | The default filter value |
| `getDefaultClause()` | `Clause` | The default clause (explicit or first in list) |
| `isHidden()` | `boolean` | Whether the filter is hidden from the UI |

### Relationship Methods

Filters support nested (dot-notation) attributes for filtering on related entities. The query service auto-joins relations found in filter attributes.

| Method | Return Type | Description |
|---|---|---|
| `isNested()` | `boolean` | `true` if the attribute contains a dot (excluding `pivot.` prefix) |
| `getRelationshipName()` | `string` | Everything before the last dot (e.g., `'department'` from `'department.name'`) |
| `getRelationshipColumn()` | `string` | Everything after the last dot (e.g., `'name'` from `'department.name'`) |

### `handle(qb, clause, value): void`

The central dispatch method called by `TableQueryService`. Execution order:

1. If `clause` is `Clause.IsSet` -- applies `attribute IS NOT NULL` directly
2. If `clause` is `Clause.IsNotSet` -- applies `attribute IS NULL` directly
3. If a custom `applyUsing` callback is set -- delegates to it
4. Otherwise -- delegates to the subclass `apply()` method

### `toArray(): FilterSerialized`

Serializes the filter for the frontend. The returned object has this shape:

```ts
interface FilterSerialized {
  key: string;       // getAttribute()
  label: string;     // getLabel()
  type: string;      // 'text', 'numeric', 'date', 'boolean', 'set'
  clauses: Clause[]; // getClauses()
  hidden?: boolean;  // only present if true
  default?: {        // only present if hasDefaultValue()
    value: any;
    clause: Clause;
  } | null;
}
```

---

## TextFilter

Provides case-insensitive text matching using `ILIKE` patterns.

**Type identifier:** `'text'`

### Default Clauses

```ts
[
  Clause.Contains,       // ILIKE '%value%'
  Clause.NotContains,    // NOT ILIKE '%value%'
  Clause.StartsWith,     // ILIKE 'value%'
  Clause.EndsWith,       // ILIKE '%value'
  Clause.NotStartsWith,  // NOT ILIKE 'value%'
  Clause.NotEndsWith,    // NOT ILIKE '%value'
  Clause.Equals,         // = value
  Clause.NotEquals,      // != value
]
```

### Validation

Accepts `string` or `number` values. Numbers are coerced to strings. Returns `null` (rejected) for all other types.

### Apply Behavior

Each clause maps to an `ILIKE` pattern:

| Clause | SQL Pattern |
|---|---|
| Contains | `attribute ILIKE '%value%'` |
| NotContains | `attribute NOT ILIKE '%value%'` |
| StartsWith | `attribute ILIKE 'value%'` |
| EndsWith | `attribute ILIKE '%value'` |
| NotStartsWith | `attribute NOT ILIKE 'value%'` |
| NotEndsWith | `attribute NOT ILIKE '%value'` |
| Equals | `attribute = :value` (exact, case-sensitive) |
| NotEquals | `attribute != :value` (exact, case-sensitive) |

### Full Example

```ts
import { TextFilter, Clause } from '@nestjs-table-module/backend';

// Basic text filter with all default clauses
TextFilter.make('name')

// With custom label and limited clauses
TextFilter.make('email', 'Email Address')
  .clauses([Clause.Contains, Clause.Equals])

// Nullable text filter with default value
TextFilter.make('nickname')
  .nullable()
  .default('john', Clause.Contains)

// Custom apply logic for computed columns
TextFilter.make('fullName', 'Full Name')
  .clauses([Clause.Contains])
  .applyUsing((qb, _attr, _clause, value) => {
    qb.andWhere(
      `CONCAT(entity.firstName, ' ', entity.lastName) ILIKE :fullName`,
      { fullName: `%${value}%` },
    );
  })
```

---

## NumericFilter

Provides numeric comparison operations with support for range queries.

**Type identifier:** `'numeric'`

### Default Clauses

```ts
[
  Clause.Equals,              // = value
  Clause.NotEquals,           // != value
  Clause.GreaterThan,         // > value
  Clause.GreaterThanOrEqual,  // >= value
  Clause.LessThan,            // < value
  Clause.LessThanOrEqual,     // <= value
  Clause.Between,             // BETWEEN min AND max
  Clause.NotBetween,          // NOT BETWEEN min AND max
]
```

### Validation

- For `Between` and `NotBetween`: requires an array of exactly 2 elements. Both elements must be valid numbers. Returns `[min, max]` as numbers, or `null` if invalid.
- For all other clauses: the value is passed through `Number()`. Returns the number, or `null` if `NaN`.

### Apply Behavior

| Clause | SQL |
|---|---|
| Equals | `attribute = :value` |
| NotEquals | `attribute != :value` |
| GreaterThan | `attribute > :value` |
| GreaterThanOrEqual | `attribute >= :value` |
| LessThan | `attribute < :value` |
| LessThanOrEqual | `attribute <= :value` |
| Between | `attribute BETWEEN :min AND :max` |
| NotBetween | `attribute NOT BETWEEN :min AND :max` |

### Full Example

```ts
import { NumericFilter, Clause } from '@nestjs-table-module/backend';

// Basic numeric filter
NumericFilter.make('age')

// With limited clauses and default
NumericFilter.make('salary', 'Salary')
  .clauses([Clause.GreaterThanOrEqual, Clause.LessThanOrEqual, Clause.Between])
  .default(50000, Clause.GreaterThanOrEqual)

// Price range filter
NumericFilter.make('price')
  .clauses([Clause.Between])
  .default([0, 1000], Clause.Between)

// Nullable with custom label
NumericFilter.make('score').nullable()
```

---

## DateFilter

Provides date-based comparison with automatic parsing to `YYYY-MM-DD` format. Uses `DATE()` wrapping for equality comparisons to ignore time components.

**Type identifier:** `'date'`

### Default Clauses

```ts
[
  Clause.Before,          // < value
  Clause.After,           // > value
  Clause.EqualOrBefore,   // <= value
  Clause.EqualOrAfter,    // >= value
  Clause.Equals,          // DATE(attribute) = value
  Clause.NotEquals,       // DATE(attribute) != value
  Clause.Between,         // BETWEEN min AND max
  Clause.NotBetween,      // NOT BETWEEN min AND max
]
```

### Validation

Values are parsed through JavaScript's `Date` constructor and normalized to `YYYY-MM-DD` format.

- For `Between` and `NotBetween`: requires an array of exactly 2 elements. Both must be parseable dates. Returns `[startDate, endDate]` as `YYYY-MM-DD` strings.
- For all other clauses: the value must be a parseable date string or number (timestamp). Returns a `YYYY-MM-DD` string, or `null` if unparseable.

### Apply Behavior

| Clause | SQL | Notes |
|---|---|---|
| Equals | `DATE(attribute) = :value` | Uses `DATE()` to strip time component |
| NotEquals | `DATE(attribute) != :value` | Uses `DATE()` to strip time component |
| Before | `attribute < :value` | Strict less-than |
| After | `attribute > :value` | Strict greater-than |
| EqualOrBefore | `attribute <= :value` | |
| EqualOrAfter | `attribute >= :value` | |
| Between | `attribute BETWEEN :min AND :max` | |
| NotBetween | `attribute NOT BETWEEN :min AND :max` | |

### Full Example

```ts
import { DateFilter, Clause } from '@nestjs-table-module/backend';

// Basic date filter
DateFilter.make('createdAt')

// With limited clauses
DateFilter.make('publishedAt', 'Published')
  .clauses([Clause.Before, Clause.After, Clause.Between])

// Default to "after" a specific date
DateFilter.make('startDate')
  .default('2024-01-01', Clause.EqualOrAfter)

// Date range filter
DateFilter.make('eventDate')
  .clauses([Clause.Between])
  .default(['2024-01-01', '2024-12-31'], Clause.Between)
```

---

## BooleanFilter

Provides true/false filtering. Unlike other filters, the clause itself determines the value -- no user input is needed beyond selecting the clause.

**Type identifier:** `'boolean'`

### Default Clauses

```ts
[Clause.IsTrue, Clause.IsFalse]
```

### Validation

Always returns `null`. The clause itself (`IsTrue` / `IsFalse`) carries all the information needed; no additional value is required.

### `default(value: boolean, clause?: Clause): this`

Overrides the base `default()` method. When `clause` is omitted, it is automatically set based on the boolean value:

- `default(true)` sets clause to `Clause.IsTrue`
- `default(false)` sets clause to `Clause.IsFalse`

### Apply Behavior

| Clause | SQL |
|---|---|
| IsTrue | `attribute = true` |
| IsFalse | `attribute = false` |

### Full Example

```ts
import { BooleanFilter } from '@nestjs-table-module/backend';

// Basic boolean filter
BooleanFilter.make('isActive')

// With default value (auto-selects IsTrue clause)
BooleanFilter.make('isPublished', 'Published').default(true)

// With explicit clause
BooleanFilter.make('isVerified').default(true, Clause.IsTrue)
```

---

## SetFilter

Provides selection-based filtering from a predefined list of options. Supports both single-value and multi-value selection.

**Type identifier:** `'set'`

### Default Clauses

```ts
[Clause.In, Clause.NotIn, Clause.Equals, Clause.NotEquals]
```

### Extra Methods

#### `options(opts: FilterOption[] | Record<string, string>): this`

Sets the available options for the filter. Accepts either an array of `{ value, label }` objects or a key-value record.

```ts
// Array format
SetFilter.make('status').options([
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
])

// Record format (keys become values, values become labels)
SetFilter.make('status').options({
  active: 'Active',
  inactive: 'Inactive',
})
```

#### `multiple(value?: boolean): this`

Controls whether the filter allows selecting multiple options. Defaults to `true` when called without arguments. The filter is multi-select by default.

```ts
SetFilter.make('status').options({...}).multiple(false)
```

#### `withoutClause(): this`

Removes clause selection from the UI and locks the filter to `Clause.Equals` only. Useful for simple dropdown selectors where the user just picks a value.

```ts
SetFilter.make('category')
  .options({ tech: 'Tech', science: 'Science' })
  .withoutClause()
```

#### `getOptions(): FilterOption[]`

Returns the list of configured options.

#### `isMultiple(): boolean`

Returns whether multi-select is enabled.

### Validation

- For `In` and `NotIn` clauses: the value must be an array. Only string elements are kept. Returns the filtered array, or `null` if empty.
- For `Equals` and `NotEquals` clauses: the value must be a string. Returns the string, or `null` otherwise.

### Apply Behavior

| Clause | SQL |
|---|---|
| In | `attribute IN (:...values)` |
| NotIn | `attribute NOT IN (:...values)` |
| Equals | `attribute = :value` |
| NotEquals | `attribute != :value` |

### Serialization

`SetFilter.toArray()` extends the base serialization with two additional fields:

```ts
{
  // ...base fields...
  options: FilterOption[];  // The list of available options
  multiple: boolean;        // Whether multi-select is enabled
}
```

### Full Example

```ts
import { SetFilter, Clause } from '@nestjs-table-module/backend';

// Multi-select status filter with In/NotIn
SetFilter.make('status').options([
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
])

// Single-select role filter using record format
SetFilter.make('role', 'User Role')
  .options({ '1': 'Admin', '2': 'Editor', '3': 'Viewer' })
  .multiple(false)
  .withoutClause()

// With default selection
SetFilter.make('priority')
  .options({ high: 'High', medium: 'Medium', low: 'Low' })
  .default(['high', 'medium'], Clause.In)

// Nullable set filter
SetFilter.make('department')
  .options({ engineering: 'Engineering', sales: 'Sales' })
  .nullable()
```

---

## TrashedFilter

A pre-configured `SetFilter` for soft-delete filtering. Automatically added to your table when `@TableConfig({ softDeletes: true })` is set.

**Extends:** `SetFilter`

### Auto-Configuration

`TrashedFilter.make()` creates a fully configured filter with:

- **Attribute:** `'trashed'` (overridable)
- **Label:** `'Trashed'` (overridable)
- **Options:**
  - `without_trashed` -- "Without trashed" (default TypeORM behavior)
  - `with_trashed` -- "With trashed" (includes soft-deleted)
  - `only_trashed` -- "Only trashed" (only soft-deleted)
- **Clause:** Locked to `Clause.Equals` via `withoutClause()`
- **Custom `applyUsing`:** Applies TypeORM soft-delete query modifications

### Custom Apply Behavior

Instead of using standard SQL comparisons, the TrashedFilter uses TypeORM's soft-delete API:

| Value | Behavior |
|---|---|
| `'with_trashed'` or `'all'` | Calls `qb.withDeleted()` to include soft-deleted records |
| `'only_trashed'` | Calls `qb.withDeleted()` then adds `entity.deletedAt IS NOT NULL` |
| `'without_trashed'` (default) | No-op; TypeORM excludes soft-deleted records by default |

### Auto-Addition

When your table class uses `@TableConfig({ softDeletes: true })`, the `BaseTable.getFilters()` method automatically appends a `TrashedFilter` instance if one is not already present in your `filters()` array. You do not need to add it manually.

```ts
@TableConfig({
  resource: UserEntity,
  softDeletes: true, // TrashedFilter is auto-added
})
export class UsersTable extends BaseTable<User> {
  filters() {
    return [
      TextFilter.make('name'),
      // TrashedFilter is automatically appended here
    ];
  }
}
```

### Full Example

```ts
import { TrashedFilter } from '@nestjs-table-module/backend';

// Default -- typically auto-added, but can be added manually
TrashedFilter.make()

// With custom attribute and label
TrashedFilter.make('deletedStatus', 'Deleted Status')
```

---

## Nested / Relationship Filters

Filters support dot-notation attributes for filtering on related entity columns. The `TableQueryService` automatically performs a `LEFT JOIN` for any relation detected in filter attributes.

```ts
// Filter on a related entity's column
TextFilter.make('department.name', 'Department')
// Generates: LEFT JOIN entity.department department
// Then: department.name ILIKE '%value%'

// Deeper nesting
TextFilter.make('department.company.name', 'Company')
// Relationship name: 'department.company'
// Column: 'name'
```

**How it works:**

1. `filter.isNested()` returns `true` when the attribute contains a `.` (and does not start with `pivot.`)
2. `filter.getRelationshipName()` returns everything before the last dot
3. `filter.getRelationshipColumn()` returns the part after the last dot
4. `TableQueryService.applyEagerLoading()` collects all nested relations from columns and filters, then calls `qb.leftJoinAndSelect()` for each

---

## Frontend Integration

Filters are serialized and sent to the frontend as part of the table meta response. The frontend `useFilters` composable manages active filter state.

### Serialized Filter Shape

The frontend receives each filter as a `FilterDef` object:

```ts
interface FilterDef {
  key: string;           // The attribute name
  label: string;         // Display label
  type: string;          // 'text', 'numeric', 'date', 'boolean', 'set'
  clauses: string[];     // Available clause values
  options?: FilterOption[]; // Only for set filters
  multiple?: boolean;    // Only for set filters
  hidden?: boolean;      // If true, not shown in UI
  default?: {
    value: any;
    clause: string;
  } | null;
}
```

### `useFilters` Composable

```ts
const {
  activeFilters,          // Record<string, { clause: string; value: string }>
  addFilter,              // (key, clause, value) => void
  removeFilter,           // (key) => void
  updateClause,           // (key, clause) => void
  updateValue,            // (key, value) => void
  isActive,               // (key) => boolean
  getActiveKeys,          // () => string[]
} = useFilters();
```

### Query Format

Active filters are sent to the backend as query parameters in the format:

```
filters[attribute][clause]=value
```

For example:
```
GET /table/users?filters[name][contains]=john&filters[status][in]=active,pending
```

The `TableQueryService.applyFilters()` method iterates over each filter key, validates the clause against the filter's allowed clauses, runs the value through the filter's `validate()` method, and then calls `filter.handle()` to apply it to the query builder.
