# NestJS + Vue Table Module

A declarative, full-featured data table system for NestJS + Vue 3 applications.

**Backend:** NestJS module with TypeORM — filtering, sorting, pagination, row/bulk actions, exports  
**Frontend:** Vue 3 `<DataTable>` component — renders everything from a single API endpoint

## Quick Start

### 1. Copy the module into your project

```bash
# Copy backend source
cp -r nestjs-table-module/backend/src/ your-project/src/table/lib/

# Create a barrel export
cat > your-project/src/table/index.ts << 'EOF'
export * from './lib';
export { TableModule } from './lib/table.module';
EOF
```

### 2. Register in AppModule

```typescript
// app.module.ts
import { TableModule } from './table';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ ... }),  // TypeORM must be registered first
    TableModule.forRoot(),                // Add after TypeORM
    // ... other modules
  ],
})
export class AppModule {}
```

### 3. Create a migration for table module tables

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableModuleTables implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'table_views',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'userId', type: 'integer', isNullable: true },
        { name: 'tableClass', type: 'varchar' },
        { name: 'tableName', type: 'varchar', isNullable: true },
        { name: 'title', type: 'varchar' },
        { name: 'requestPayload', type: 'jsonb' },
        { name: 'createdAt', type: 'timestamp', default: 'now()' },
        { name: 'updatedAt', type: 'timestamp', default: 'now()' },
      ],
    }));

    await queryRunner.createTable(new Table({
      name: 'export_jobs',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
        { name: 'tableClass', type: 'varchar' },
        { name: 'exportName', type: 'varchar' },
        { name: 'fileName', type: 'varchar' },
        { name: 'format', type: 'varchar' },
        { name: 'queryState', type: 'jsonb' },
        { name: 'selectedIds', type: 'text', isNullable: true },
        { name: 'status', type: 'varchar', default: "'pending'" },
        { name: 'progress', type: 'integer', default: 0 },
        { name: 'filePath', type: 'varchar', isNullable: true },
        { name: 'userId', type: 'integer' },
        { name: 'createdAt', type: 'timestamp', default: 'now()' },
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('export_jobs', true);
    await queryRunner.dropTable('table_views', true);
  }
}
```

### 4. Create a Table class

```typescript
// src/users/tables/users.table.ts
import 'reflect-metadata';
import {
  BaseTable, TableConfig,
  TextColumn, DateTimeColumn, BadgeColumn, BooleanColumn, ActionColumn,
  TextFilter, SetFilter, DateFilter, BooleanFilter,
  Action, Export, EmptyState,
  SortDirection, PaginationType, Variant, ExportFormat,
} from '../../table';
import { UserEntity } from '../infrastructure/persistence/relational/entities/user.entity';

@TableConfig({
  resource: UserEntity,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
  perPageOptions: [15, 30, 50],
  defaultPerPage: 15,
  softDeletes: true,
  searchable: ['firstName', 'lastName', 'email'],
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      TextColumn.make('firstName', 'First Name').sortable().searchable(),
      TextColumn.make('email').sortable().searchable(),
      BadgeColumn.make('status')
        .variant({ active: 'success', inactive: 'destructive' }),
      BooleanColumn.make('isActive')
        .trueLabel('Active').falseLabel('Inactive'),
      DateTimeColumn.make('createdAt', 'Joined').sortable().format('YYYY-MM-DD'),
      ActionColumn.make(),
    ];
  }

  filters() {
    return [
      TextFilter.make('email'),
      SetFilter.make('status').options([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]),
      BooleanFilter.make('isActive'),
      DateFilter.make('createdAt'),
    ];
  }

  actions() {
    return [
      Action.make('view', 'View').asLink().icon('eye')
        .url((row) => `/users/${row.id}`),
      Action.make('delete', 'Delete').asButton()
        .variant(Variant.Destructive).icon('trash')
        .confirm({ title: 'Delete user?', message: 'This cannot be undone.' })
        .handle(async (item, repo) => {
          await repo.softDelete(item.id);
          return { message: 'Deleted' };
        }),
    ];
  }

  exports() {
    return [
      Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx),
      Export.make('CSV', 'users.csv', ExportFormat.Csv),
    ];
  }
}
```

### 5. Add a controller endpoint

```typescript
// src/users/users.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TableQueryService } from '../table';
import { UsersTable } from './tables/users.table';

@Controller({ path: 'users', version: '1' })
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly tableQuery: TableQueryService,
    private readonly usersTable: UsersTable,
  ) {}

  @Get('table')
  async table(@Query() query: any) {
    return this.tableQuery.execute(this.usersTable, query);
  }
}
```

### 6. Register the table in the module

```typescript
// src/users/users.module.ts
import { UsersTable } from './tables/users.table';

@Module({
  providers: [UsersTable],  // Add table class as provider
  controllers: [UsersController],
})
export class UsersModule {}
```

### 7. Frontend — Vue DataTable component

```vue
<script setup>
import { DataTable } from '@kkmodules/vue-table'
</script>

<template>
  <DataTable
    endpoint="/api/v1/users/table"
    :headers="{ Authorization: `Bearer ${token}` }"
    :sync-url="true"
    @row-click="(row) => router.push(`/users/${row.id}`)"
  />
</template>
```

The DataTable renders columns, filters, pagination, search, actions, and exports — all configured from the backend table class.

---

## Column Types

| Type | Usage | Key Methods |
|------|-------|-------------|
| `TextColumn` | Strings | `.sortable()`, `.searchable()`, `.truncate(2)` |
| `NumericColumn` | Numbers | `.rightAligned()`, `.mapAs(v => \`$${v}\`)` |
| `DateColumn` | Dates | `.format('DD/MM/YYYY')` |
| `DateTimeColumn` | Timestamps | `.format('YYYY-MM-DD HH:mm')` |
| `BooleanColumn` | True/False | `.trueLabel()`, `.falseLabel()`, `.trueIcon()` |
| `BadgeColumn` | Status badges | `.variant({ active: 'success' })`, `.icon()` |
| `ImageColumn` | Avatars | `.size()`, `.rounded()`, `.fallback()` |
| `ActionColumn` | Row actions | `.asDropdown()` — always place last |

**Common methods (all columns):** `.sortable()`, `.searchable()`, `.hidden()`, `.toggleable()`, `.align()`, `.wrap()`, `.mapAs(fn)`, `.exportAs(fn)`, `.dontExport()`

## Filter Types

| Type | Clauses |
|------|---------|
| `TextFilter` | Contains, NotContains, StartsWith, EndsWith, Equals, NotEquals |
| `NumericFilter` | Equals, GreaterThan, LessThan, Between, NotBetween |
| `DateFilter` | Before, After, Between, Equals |
| `BooleanFilter` | IsTrue, IsFalse |
| `SetFilter` | In, NotIn — `.options([{ value, label }])` |
| `TrashedFilter` | Auto-added when `softDeletes: true` |

**Common methods:** `.clauses([...])`, `.nullable()`, `.default(value)`, `.hidden()`, `.applyUsing(fn)`

## Actions

```typescript
// Link action — navigates
Action.make('edit', 'Edit').asLink().url((row) => `/edit/${row.id}`)

// Button action — executes logic
Action.make('delete', 'Delete').asButton()
  .variant(Variant.Destructive)
  .confirm({ title: 'Sure?', message: '...' })
  .handle(async (item, repo) => { await repo.delete(item.id) })

// Bulk action — operates on selected rows
Action.make('bulkDelete', 'Delete All').bulk()
  .handle(async (ids, repo) => { await repo.delete(ids) })
```

## API Response Shape

```json
{
  "meta": {
    "columns": [...],
    "filters": [...],
    "actions": { "row": [...], "bulk": [...] },
    "exports": [...],
    "search": { "enabled": true },
    "perPageOptions": [15, 30, 50]
  },
  "data": [...],
  "pagination": {
    "type": "full",
    "currentPage": 1,
    "lastPage": 5,
    "perPage": 15,
    "total": 73
  }
}
```

## Tech Stack

- **Backend:** NestJS 10+, TypeORM 0.3+, ExcelJS, PDFKit
- **Frontend:** Vue 3, shadcn-vue components, Tailwind CSS
- **Tests:** Jest (373 tests)
