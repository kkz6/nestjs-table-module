# Table Module — Copilot Instructions

This is a NestJS + Vue 3 data table module. When working with this codebase:

## Creating a Table

1. Create a TypeORM entity (or use an existing one)
2. Create a table class extending `BaseTable<T>` with `@TableConfig({ resource: Entity })` 
3. Define `columns()`, `filters()`, `actions()`, `exports()`, `emptyState()` methods
4. Wire into a controller: inject `TableQueryService`, call `execute(table, query)` on GET
5. Frontend: `<DataTable endpoint="/api/resource" />`

## Column Types

- `TextColumn.make('attr')` — strings
- `NumericColumn.make('attr')` — numbers
- `DateColumn.make('attr').format('YYYY-MM-DD')` — dates
- `DateTimeColumn.make('attr')` — timestamps
- `BooleanColumn.make('attr').trueLabel('Yes').falseLabel('No')` — booleans
- `BadgeColumn.make('attr').variant({ active: 'success' })` — status badges
- `ImageColumn.make('attr').size(ImageSize.Medium).rounded()` — images
- `ActionColumn.make()` — row action buttons (always last in array)

All columns support: `.sortable()`, `.searchable()`, `.toggleable()`, `.visible()/.hidden()`, `.align()`, `.mapAs(fn)`, `.exportAs(fn)`

## Filter Types

- `TextFilter` — Contains, StartsWith, Equals, etc.
- `NumericFilter` — GreaterThan, Between, etc.
- `DateFilter` — Before, After, Between, etc.
- `BooleanFilter` — IsTrue, IsFalse
- `SetFilter.make('attr').options([...])` — In, NotIn

All filters support: `.clauses([])`, `.nullable()`, `.default(val)`, `.hidden()`, `.applyUsing(fn)`

## Actions

```typescript
Action.make('name').asButton().variant(Variant.Destructive)
  .confirm({ title: 'Sure?' }).handle(async (item, repo) => repo.delete(item.id))
Action.make('name').asLink().url((row) => `/path/${row.id}`)
Action.make('name').bulk().handle(async (ids, repo) => repo.delete(ids))
```

## Exports

```typescript
Export.make('Excel', 'file.xlsx', ExportFormat.Xlsx)
```

Runs async with SSE progress — no polling needed.

## File Locations

- Backend source: `backend/src/`
- Frontend source: `frontend/src/`
- Tests: `backend/src/**/__tests__/*.spec.ts`
- Full docs: `docs/`
- AI skills: `skills/`
