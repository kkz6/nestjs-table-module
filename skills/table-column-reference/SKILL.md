---
name: table-column-reference
description: Use when adding or configuring table columns — reference for all 9 column types, their methods, and configuration options
---

# Table Column Reference

## Overview

Quick reference for all column types and their chainable builder methods. All columns extend the base `Column` class.

## Column Types

| Type | Class | Use For |
|------|-------|---------|
| `text` | `TextColumn` | Strings, names, descriptions |
| `numeric` | `NumericColumn` | Numbers, amounts, counts |
| `date` | `DateColumn` | Date only (no time) |
| `datetime` | `DateTimeColumn` | Full timestamps |
| `boolean` | `BooleanColumn` | True/false with labels/icons |
| `badge` | `BadgeColumn` | Status values with color variants |
| `image` | `ImageColumn` | Avatars, thumbnails |
| `action` | `ActionColumn` | Row action buttons (always last) |

## Base Column Methods (All Types)

### Factory
```typescript
TextColumn.make('attribute')              // Auto-generates header from attribute
TextColumn.make('attribute', 'My Header') // Explicit header
```

### Display
```typescript
.sortable()              // Enable sorting (default: false)
.searchable()            // Enable global search (default: false)
.toggleable()            // User can show/hide (default: true)
.visible() / .hidden()   // Default visibility
.align(ColumnAlignment.Center)  // or .leftAligned() .centerAligned() .rightAligned()
.wrap()                  // Allow text wrapping
.truncate(50)            // Truncate at N chars
.headerClass('font-bold')
.cellClass('text-sm')
.stickable()             // Allow sticky column
```

### Data Transformation
```typescript
.mapAs((value, item) => value.toUpperCase())    // Transform for display
.exportAs((value, item) => `$${value}`)         // Transform for export
.dontExport()                                    // Exclude from exports
```

### Custom Sort
```typescript
.sortUsing((qb, direction) => {
  qb.orderBy('LOWER(entity.name)', direction.toUpperCase());
})
```

### Relations
```typescript
TextColumn.make('department.name')  // Auto-joins department relation
// isNested() → true
// getRelationshipName() → 'department'
// getRelationshipColumn() → 'name'
```

## Type-Specific Methods

### DateColumn / DateTimeColumn
```typescript
DateColumn.make('createdAt').format('YYYY-MM-DD')
DateTimeColumn.make('updatedAt').format('YYYY-MM-DD HH:mm')

// Set global defaults
DateColumn.setDefaultFormat('DD/MM/YYYY');
DateTimeColumn.setDefaultFormat('DD/MM/YYYY HH:mm');
```

### BooleanColumn
```typescript
BooleanColumn.make('isActive')
  .trueLabel('Active')      // Default: 'Yes'
  .falseLabel('Inactive')   // Default: 'No'
  .trueIcon('check')        // Shows icon instead of label
  .falseIcon('x')

// Global defaults
BooleanColumn.setDefaultTrueLabel('Yes');
BooleanColumn.setDefaultTrueIcon('check');
```

### BadgeColumn
```typescript
// Variant from map
BadgeColumn.make('status').variant({
  active: 'success',
  inactive: 'destructive',
  pending: 'warning',
})

// Variant from function
BadgeColumn.make('priority').variant((value) => 
  value > 7 ? 'destructive' : value > 4 ? 'warning' : 'default'
)

// Add icons
.icon({ active: 'check-circle', inactive: 'x-circle' })
// or
.icon((value) => value === 'active' ? 'check' : 'alert')
```

**Variants:** `default`, `info`, `success`, `warning`, `destructive`, `secondary`, `outline`, `ghost`, `link`

### ImageColumn
```typescript
ImageColumn.make('avatar')
  .size(ImageSize.Medium)      // Small | Medium | Large | ExtraLarge
  .position(ImagePosition.Start) // Start | End
  .fallback('/placeholder.png')
  .rounded()
```

### ActionColumn
```typescript
ActionColumn.make()              // Attribute is always '_actions'
ActionColumn.make('Custom Header')
  .asDropdown()                  // Render as "..." dropdown menu

// Global default
ActionColumn.defaultAsDropdown(true);
```

**ActionColumn rules:**
- Always right-aligned, not toggleable, not exportable
- Place last in `columns()` array
- Only needed if you have row actions

## Serialization

Every column serializes to `ColumnSerialized` via `.toArray()`. This JSON is sent to the frontend as part of `meta.columns`.
