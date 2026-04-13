---
name: table-filter-reference
description: Use when adding or configuring table filters — reference for all 7 filter types, 24 clauses, and configuration options
---

# Table Filter Reference

## Overview

Quick reference for all filter types and the 24 comparison clauses. Filters are defined in the table's `filters()` method and generate TypeORM WHERE conditions.

## Filter Types

| Type | Class | Default Clauses |
|------|-------|----------------|
| `text` | `TextFilter` | Contains, NotContains, StartsWith, EndsWith, NotStartsWith, NotEndsWith, Equals, NotEquals |
| `numeric` | `NumericFilter` | Equals, NotEquals, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, Between, NotBetween |
| `date` | `DateFilter` | Before, After, EqualOrBefore, EqualOrAfter, Equals, NotEquals, Between, NotBetween |
| `boolean` | `BooleanFilter` | IsTrue, IsFalse |
| `set` | `SetFilter` | In, NotIn, Equals, NotEquals |
| `trashed` | `TrashedFilter` | Equals (auto-configured) |

## Base Filter Methods (All Types)

### Factory
```typescript
TextFilter.make('attribute')              // Auto-generates label
TextFilter.make('attribute', 'My Label')  // Explicit label
```

### Configuration
```typescript
.clauses([Clause.Contains, Clause.Equals])  // Override available clauses
.nullable()                                   // Add IsSet + IsNotSet clauses
.default('active', Clause.Equals)            // Set default value and clause
.hidden()                                     // Hide from filter UI
.applyUsing((qb, attribute, clause, value) => {
  // Completely custom filter logic
  qb.andWhere(`custom_function(${attribute}) = :val`, { val: value });
})
```

### Relations
```typescript
TextFilter.make('department.name')  // Filters on joined relation
```

## All 24 Clauses

### Text Clauses
| Clause | SQL | Value |
|--------|-----|-------|
| `Clause.Contains` | `ILIKE '%value%'` | string |
| `Clause.NotContains` | `NOT ILIKE '%value%'` | string |
| `Clause.StartsWith` | `ILIKE 'value%'` | string |
| `Clause.EndsWith` | `ILIKE '%value'` | string |
| `Clause.NotStartsWith` | `NOT ILIKE 'value%'` | string |
| `Clause.NotEndsWith` | `NOT ILIKE '%value'` | string |
| `Clause.Equals` | `= value` | string |
| `Clause.NotEquals` | `!= value` | string |

### Numeric Clauses
| Clause | SQL | Value |
|--------|-----|-------|
| `Clause.GreaterThan` | `> value` | number |
| `Clause.GreaterThanOrEqual` | `>= value` | number |
| `Clause.LessThan` | `< value` | number |
| `Clause.LessThanOrEqual` | `<= value` | number |
| `Clause.Between` | `BETWEEN min AND max` | [number, number] |
| `Clause.NotBetween` | `NOT BETWEEN min AND max` | [number, number] |

### Date Clauses
| Clause | SQL | Value |
|--------|-----|-------|
| `Clause.Before` | `< value` | date string |
| `Clause.After` | `> value` | date string |
| `Clause.EqualOrBefore` | `<= value` | date string |
| `Clause.EqualOrAfter` | `>= value` | date string |

### Boolean Clauses
| Clause | SQL | Value |
|--------|-----|-------|
| `Clause.IsTrue` | `= true` | none |
| `Clause.IsFalse` | `= false` | none |
| `Clause.IsSet` | `IS NOT NULL` | none |
| `Clause.IsNotSet` | `IS NULL` | none |

### Set Clauses
| Clause | SQL | Value |
|--------|-----|-------|
| `Clause.In` | `IN (values)` | string[] |
| `Clause.NotIn` | `NOT IN (values)` | string[] |

## Type-Specific Configuration

### SetFilter
```typescript
// Options from array
SetFilter.make('status').options([
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
])

// Options from Record
SetFilter.make('role').options({
  '1': 'Admin',
  '2': 'User',
})

.multiple()         // Allow multi-select (default: true)
.withoutClause()    // Use only Equals clause (single select)
```

### BooleanFilter
```typescript
BooleanFilter.make('isActive')
  .default(true)    // Auto-sets clause to IsTrue
  .default(false)   // Auto-sets clause to IsFalse
```

### TrashedFilter
Auto-added when `softDeletes: true` in @TableConfig. Manually add:
```typescript
TrashedFilter.make()  // Pre-configured with without/with/only trashed options
```

## Request Format

Filters are sent as query parameters:
```
GET /api/users?filters[name][contains]=john&filters[status][in]=active,pending&filters[createdAt][after]=2025-01-01
```

## Common Mistakes

- **Wrong clause for filter type** — DateFilter doesn't accept Contains. Check the type's default clauses.
- **Missing relation join** — Nested filters like `department.name` need the relation defined on the entity.
- **Not validating input** — The filter's `validate()` method rejects bad values automatically. Don't bypass it.
