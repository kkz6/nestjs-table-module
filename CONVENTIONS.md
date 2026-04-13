# Table Module Conventions

Generic AI agent instructions for this NestJS + Vue 3 data table module.

## Project Layout

```
backend/           NestJS module (TypeORM, class-validator, ExcelJS, PDFKit)
frontend/          Vue 3 component library (shadcn-vue, Tailwind CSS)
skills/            AI agent skills — detailed reference for each feature
docs/              Full documentation — 15 pages covering every API
```

## Creating a New Table

**Pattern:** Entity → Table Class → Controller → Frontend Page

```typescript
// 1. Table class
@TableConfig({ resource: MyEntity, softDeletes: true, searchable: ['name'] })
export class MyTable extends BaseTable<MyEntity> {
  columns() { return [ TextColumn.make('name').sortable().searchable(), ActionColumn.make() ]; }
  filters() { return [ TextFilter.make('name') ]; }
  actions() { return [ Action.make('edit').asLink().url((r) => `/items/${r.id}`) ]; }
  exports() { return [ Export.make('Excel', 'items.xlsx', ExportFormat.Xlsx) ]; }
}

// 2. Controller
@Get()
async findAll(@Query() query: TableQueryDto) {
  return this.tableQuery.execute(this.myTable, query);
}

// 3. Frontend
<DataTable endpoint="/api/items" table-class="MyTable" />
```

## Available Column Types

TextColumn, NumericColumn, DateColumn, DateTimeColumn, BooleanColumn, BadgeColumn, ImageColumn, ActionColumn

## Available Filter Types

TextFilter, NumericFilter, DateFilter, BooleanFilter, SetFilter, TrashedFilter

## Detailed Reference

Read `skills/` directory for comprehensive guides:
- `skills/creating-a-table/` — Full creation workflow
- `skills/table-column-reference/` — Every column method
- `skills/table-filter-reference/` — Every filter clause  
- `skills/table-action-reference/` — Action builder API
- `skills/adding-table-exports/` — Export pipeline
- `skills/integrating-table-module/` — First-time project setup

## Testing

```bash
cd backend && npx jest   # 373 tests, 22 suites
```
