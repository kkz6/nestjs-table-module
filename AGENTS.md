# NestJS + Vue Table Module — Agent Instructions

This is a reusable data table module for NestJS (backend) + Vue 3 (frontend) projects.

## Architecture

```
backend/   → NestJS module with TypeORM, exports TableModule.forRoot()
frontend/  → Vue 3 component library, exports <DataTable> component
skills/    → AI agent reference guides for working with this module
docs/      → Full documentation for every feature
```

## How to Create a Table

Follow this 4-step pattern. See `skills/creating-a-table/SKILL.md` for complete details.

1. **Entity** — TypeORM entity at `src/{resource}/entities/*.entity.ts`
2. **Table Class** — Extend `BaseTable<T>` with `@TableConfig` decorator, define `columns()`, `filters()`, `actions()`, `exports()`
3. **Controller** — Inject `TableQueryService`, call `this.tableQuery.execute(table, query)` on GET endpoint
4. **Frontend** — Use `<DataTable endpoint="/api/resource" table-class="TableName" />`

## Quick API Reference

### Columns (defined in `columns()`)
```typescript
TextColumn.make('name').sortable().searchable()
NumericColumn.make('amount').sortable()
DateColumn.make('date').sortable().format('YYYY-MM-DD')
DateTimeColumn.make('createdAt').sortable()
BooleanColumn.make('isActive').trueLabel('Yes').falseLabel('No')
BadgeColumn.make('status').variant({ active: 'success', inactive: 'destructive' })
ImageColumn.make('avatar').size(ImageSize.Medium).rounded()
ActionColumn.make()  // Always last
```

### Filters (defined in `filters()`)
```typescript
TextFilter.make('name')           // Contains, StartsWith, Equals, etc.
NumericFilter.make('amount')      // GreaterThan, Between, etc.
DateFilter.make('createdAt')      // Before, After, Between, etc.
BooleanFilter.make('isActive')    // IsTrue, IsFalse
SetFilter.make('status').options([{ value: 'active', label: 'Active' }])
```

### Actions (defined in `actions()`)
```typescript
// Row action (link)
Action.make('edit').asLink().url((row) => `/resource/${row.id}/edit`)

// Row action (button with confirmation)
Action.make('delete').asButton().variant(Variant.Destructive)
  .confirm({ title: 'Delete?' })
  .handle(async (item, repo) => repo.softDelete(item.id))

// Bulk action
Action.make('bulkDelete').bulk().variant(Variant.Destructive)
  .handle(async (ids, repo) => repo.softDelete(ids))
```

### Exports (defined in `exports()`)
```typescript
Export.make('Excel', 'data.xlsx', ExportFormat.Xlsx)
Export.make('CSV', 'data.csv', ExportFormat.Csv)
Export.make('PDF', 'data.pdf', ExportFormat.Pdf)
```

### @TableConfig Options
```typescript
@TableConfig({
  resource: Entity,          // TypeORM entity class (required)
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,  // Full | Simple | Cursor
  perPageOptions: [15, 30, 50, 100],
  softDeletes: true,         // Auto-adds TrashedFilter + restore/forceDelete actions
  searchable: ['name'],      // Global search fields
  stickyHeader: true,
  debounce: 300,
})
```

## Detailed Reference

For deeper information on any feature, see:
- `skills/table-column-reference/SKILL.md` — All column methods
- `skills/table-filter-reference/SKILL.md` — All 24 filter clauses
- `skills/table-action-reference/SKILL.md` — Action builder API
- `skills/adding-table-exports/SKILL.md` — Export pipeline
- `skills/integrating-table-module/SKILL.md` — First-time setup
- `docs/` — Complete documentation with examples

## Testing

```bash
cd backend && npx jest   # 373 tests across 22 suites
```
