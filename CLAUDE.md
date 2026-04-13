# NestJS + Vue Table Module

## Project Structure

- `backend/` — NestJS module (TypeORM, class-validator)
- `frontend/` — Vue 3 component library (shadcn-vue, Tailwind)
- `skills/` — AI agent skills for working with this module
- `docs/` — Full documentation

## Skills

When working with this table module, use the skills in `skills/` for guidance:

- `skills/creating-a-table/` — Complete 4-step workflow to create a new table (Entity, Table Class, Controller, Frontend)
- `skills/table-column-reference/` — All 9 column types and their methods
- `skills/table-filter-reference/` — All 7 filter types and 24 clauses
- `skills/table-action-reference/` — Row/bulk actions, confirmations, handlers
- `skills/adding-table-exports/` — Export builder and async SSE pipeline
- `skills/integrating-table-module/` — First-time setup in a NestJS project

## Key Patterns

- Tables extend `BaseTable<T>` with `@TableConfig({ resource: Entity })` decorator
- Columns, filters, actions, exports are defined via chainable builder APIs
- `TableQueryService.execute(table, query)` handles all query building
- Frontend uses `<DataTable endpoint="/api/resource" />` component
- All state syncs to URL query params

## Testing

```bash
cd backend && npx jest          # 373 tests
```

## Tech Stack

- Backend: NestJS 11, TypeORM, class-validator, ExcelJS, PDFKit
- Frontend: Vue 3, shadcn-vue (radix-vue), Tailwind CSS, composables
- Communication: REST API with SSE for export progress
