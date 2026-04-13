---
name: creating-a-table
description: Use when creating a new data table in a NestJS project using the table module — covers entity, table class, controller integration, and frontend page setup
---

# Creating a Table

## Overview

Create a fully functional data table by defining a table class that extends `BaseTable`, then wiring it into a NestJS controller and Vue frontend. Every table follows the same 4-step pattern: Entity → Table Class → Controller → Frontend.

## When to Use

- User asks to "create a table for [resource]" or "add a table view"
- New CRUD resource needs listing with filters, sorting, search
- Migrating an existing list/grid to the table module

## The Pattern

### Step 1: Ensure the TypeORM Entity Exists

The table module works with TypeORM entities. If one doesn't exist for the resource, create it first.

```typescript
// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()  // Required if softDeletes: true
  deletedAt: Date;
}
```

### Step 2: Create the Table Class

```typescript
// src/users/users.table.ts
import 'reflect-metadata';
import {
  BaseTable, TableConfig,
  TextColumn, DateTimeColumn, BadgeColumn, BooleanColumn, ActionColumn,
  TextFilter, DateFilter, SetFilter, BooleanFilter,
  Action, Export, EmptyState,
  SortDirection, PaginationType, Variant, ExportFormat,
} from '@kkmodules/nestjs-table';

@TableConfig({
  resource: UserEntity,                    // TypeORM entity class
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,         // Full | Simple | Cursor
  perPageOptions: [15, 30, 50, 100],
  defaultPerPage: 15,
  softDeletes: true,                       // Auto-adds TrashedFilter + restore/forceDelete
  searchable: ['name', 'email'],           // Global search fields
  stickyHeader: true,
  debounce: 300,
})
export class UsersTable extends BaseTable<UserEntity> {

  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable().searchable(),
      BadgeColumn.make('status').variant({
        active: 'success',
        inactive: 'destructive',
        pending: 'warning',
      }),
      BooleanColumn.make('isActive').trueLabel('Yes').falseLabel('No'),
      DateTimeColumn.make('createdAt').sortable(),
      ActionColumn.make(),   // Always last — renders row action buttons
    ];
  }

  filters() {
    return [
      TextFilter.make('name'),
      TextFilter.make('email'),
      SetFilter.make('status').options([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ]),
      BooleanFilter.make('isActive'),
      DateFilter.make('createdAt'),
    ];
  }

  actions() {
    return [
      // Row actions
      Action.make('edit', 'Edit')
        .asLink()
        .url((row) => `/users/${row.id}/edit`),

      Action.make('delete', 'Delete')
        .asButton()
        .variant(Variant.Destructive)
        .confirm({ title: 'Delete user?', message: 'This cannot be undone.' })
        .handle(async (item, repo) => repo.softDelete(item.id)),

      // Bulk actions
      Action.make('bulkDelete', 'Delete Selected')
        .bulk()
        .variant(Variant.Destructive)
        .confirm({ title: 'Delete selected users?' })
        .handle(async (ids, repo) => repo.softDelete(ids)),
    ];
  }

  exports() {
    return [
      Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx),
      Export.make('CSV', 'users.csv', ExportFormat.Csv),
    ];
  }

  emptyState() {
    return EmptyState.make()
      .title('No users found')
      .message('Try adjusting your filters or create a new user.')
      .action({ label: 'Create User', url: '/users/create' });
  }
}
```

### Step 3: Wire into Controller

```typescript
// src/users/users.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TableQueryService, TableQueryDto } from '@kkmodules/nestjs-table';
import { UsersTable } from './users.table';

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private tableQuery: TableQueryService,
    private usersTable: UsersTable,
  ) {}

  @Get()
  async findAll(@Query() query: TableQueryDto) {
    return this.tableQuery.execute(this.usersTable, query);
  }
}
```

Register the table in your module:
```typescript
// src/users/users.module.ts
@Module({
  providers: [UsersTable],
  controllers: [UsersController],
})
export class UsersModule {}
```

### Step 4: Frontend Page

```vue
<!-- src/views/UsersPage.vue -->
<template>
  <div class="container mx-auto py-6">
    <h1 class="text-2xl font-bold mb-6">Users</h1>
    <DataTable
      endpoint="/api/users"
      table-class="UsersTable"
      :sync-url="true"
    />
  </div>
</template>

<script setup lang="ts">
import { DataTable } from '@kkmodules/vue-table';
</script>
```

## Quick Reference

| What | Where | Required? |
|------|-------|-----------|
| TypeORM Entity | `src/{resource}/entities/*.entity.ts` | Yes |
| Table Class | `src/{resource}/*.table.ts` | Yes |
| Controller | `src/{resource}/*.controller.ts` | Yes |
| Vue Page | `src/views/*.vue` | Yes |
| `@DeleteDateColumn` | Entity | Only if `softDeletes: true` |
| `ActionColumn.make()` | `columns()` | Only if you have row actions |

## Common Mistakes

- **Forgetting `ActionColumn.make()`** — Row actions won't render without it in columns()
- **Missing `@DeleteDateColumn`** — softDeletes will error if entity lacks it
- **Not registering table as provider** — NestJS DI won't resolve it in the controller
- **Wrong endpoint in DataTable** — Must match controller's route exactly
- **Forgetting `reflect-metadata` import** — @TableConfig decorator needs it
