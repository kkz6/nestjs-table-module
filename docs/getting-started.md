# Getting Started

This guide walks you through setting up the **NestJS Table Module** in a full-stack application with a NestJS backend and Vue 3 frontend.

---

## Prerequisites

- **Node.js** >= 18
- A **NestJS** project (based on [brocoders/nestjs-boilerplate](https://github.com/nickmessing/nestjs-boilerplate) or similar)
- **TypeORM** configured in your NestJS application
- A **Vue 3** frontend project
- **Tailwind CSS** installed in your frontend

---

## Backend Installation

Install the backend package in your NestJS project:

```bash
npm install @kkmodules/nestjs-table
```

Or, if developing locally, copy the `backend/` folder into your project's `src/modules/table/` directory.

### Peer Dependencies

The following peer dependencies must be available in your NestJS project:

```json
{
  "@nestjs/common": "^11.0.0",
  "@nestjs/core": "^11.0.0",
  "@nestjs/typeorm": "^11.0.0",
  "class-transformer": "^0.5.0",
  "class-validator": "^0.14.0",
  "rxjs": "^7.0.0",
  "typeorm": "^0.3.0"
}
```

---

## Frontend Installation

Install the frontend package in your Vue 3 project:

```bash
npm install @kkmodules/vue-table
```

Or, if developing locally, copy the `frontend/` folder into your project.

### Peer Dependencies

```json
{
  "vue": "^3.5.0",
  "vue-router": "^4.0.0"
}
```

---

## Backend Setup

### 1. Import TableModule in Your AppModule

Open your main `AppModule` (or the relevant feature module) and import `TableModule.forRoot()`. You can optionally pass an array of table class instances to register them immediately.

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableModule } from '@kkmodules/nestjs-table';
import { UsersTable } from './tables/users.table';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ... your TypeORM config
    }),
    TableModule.forRoot([
      new UsersTable(),
    ]),
  ],
})
export class AppModule {}
```

Passing an empty array is valid if you plan to register tables later:

```typescript
TableModule.forRoot([])
```

### 2. Add Required Entities to TypeORM

The table module uses two entities for saved views and export jobs. Make sure your TypeORM configuration includes them. `TableModule.forRoot()` handles this automatically via `TypeOrmModule.forFeature()`, but your database must support the `table_views` and `export_jobs` tables.

Run your TypeORM migrations or enable `synchronize: true` in development to create these tables.

**TableViewEntity** (`table_views` table):

| Column          | Type      | Description                     |
|-----------------|-----------|---------------------------------|
| id              | int (PK)  | Auto-incremented primary key    |
| userId          | int       | The user who created the view   |
| tableClass      | varchar   | The table class name            |
| tableName       | varchar   | Optional name identifier        |
| title           | varchar   | User-given title for the view   |
| requestPayload  | jsonb     | Saved filter/sort/search state  |
| createdAt       | timestamp | Auto-generated                  |
| updatedAt       | timestamp | Auto-generated                  |

**ExportJobEntity** (`export_jobs` table):

| Column       | Type         | Description                     |
|--------------|--------------|---------------------------------|
| id           | uuid (PK)    | UUID primary key                |
| tableClass   | varchar      | The table class name            |
| exportName   | varchar      | The export configuration name   |
| fileName     | varchar      | Output file name                |
| format       | varchar      | xlsx, csv, or pdf               |
| queryState   | jsonb        | Saved query state for export    |
| selectedIds  | text         | Comma-separated selected IDs    |
| status       | varchar      | pending, processing, completed  |
| progress     | int          | 0-100 progress percentage       |
| filePath     | varchar      | Path to generated file          |
| userId       | int          | The user who triggered export   |
| createdAt    | timestamp    | Auto-generated                  |

### 3. What TableModule.forRoot() Provides

When you call `TableModule.forRoot(tables)`, the module:

- Imports `TypeOrmModule.forFeature([TableViewEntity, ExportJobEntity])`
- Registers controllers: `TableActionController`, `TableExportController`, `TableViewController`
- Registers services: `TableQueryService`, `TableExportService`, `TableViewService`, `TableSseService`
- Registers `TableRegistry` and populates it with the provided table instances
- Exports `TableQueryService`, `TableRegistry`, and `TableSseService` for use in your own controllers

---

## Frontend Setup

### 1. Import the DataTable Component

The main component you will use is `DataTable`. Import it from the package:

```typescript
import { DataTable } from '@kkmodules/vue-table';
```

### 2. Configure Tailwind CSS

Add the library's source files to your Tailwind CSS `content` paths so the utility classes are included:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,vue}',
    './node_modules/@kkmodules/vue-table/src/**/*.{ts,vue}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
```

### 3. Define CSS Variables

Add the required CSS custom properties to your global stylesheet. These variables power the shadcn-vue design system:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

---

## Quick Example

This section walks through creating a complete Users table from backend to frontend.

### Step 1: Define Your Entity

```typescript
// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

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

  @DeleteDateColumn()
  deletedAt: Date;
}
```

### Step 2: Create a Table Class

```typescript
// src/users/tables/users.table.ts
import { BaseTable, TableConfig } from '@kkmodules/nestjs-table';
import {
  TextColumn, DateTimeColumn, BadgeColumn,
  BooleanColumn, ActionColumn,
} from '@kkmodules/nestjs-table';
import {
  TextFilter, SetFilter, DateFilter, BooleanFilter,
} from '@kkmodules/nestjs-table';
import { Action, Export, EmptyState } from '@kkmodules/nestjs-table';
import {
  SortDirection, PaginationType, Variant, ExportFormat,
} from '@kkmodules/nestjs-table';
import { UserEntity } from '../entities/user.entity';

@TableConfig({
  resource: UserEntity,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
  perPageOptions: [15, 30, 50, 100],
  softDeletes: true,
  searchable: ['name', 'email'],
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
      BooleanColumn.make('isActive')
        .trueLabel('Active')
        .falseLabel('Inactive'),
      DateTimeColumn.make('createdAt')
        .sortable()
        .format('YYYY-MM-DD HH:mm'),
      ActionColumn.make(),
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
      DateFilter.make('createdAt'),
      BooleanFilter.make('isActive'),
    ];
  }

  actions() {
    return [
      Action.make('edit', 'Edit')
        .asLink()
        .icon('pencil')
        .url((row) => `/users/${row.id}/edit`),
      Action.make('delete', 'Delete')
        .asButton()
        .variant(Variant.Destructive)
        .icon('trash')
        .confirm({
          title: 'Delete user?',
          message: 'This action cannot be undone.',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
        })
        .handle(async (item, repo) => {
          await repo.softDelete(item.id);
        }),
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
      .message('Create your first user to get started.')
      .icon('users')
      .action({ label: 'Create User', url: '/users/create' });
  }
}
```

### Step 3: Register the Table and Create a Controller

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableModule } from '@kkmodules/nestjs-table';
import { UserEntity } from './entities/user.entity';
import { UsersTable } from './tables/users.table';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TableModule.forRoot([new UsersTable()]),
  ],
  controllers: [UsersController],
})
export class UsersModule {}
```

```typescript
// src/users/users.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { TableQueryService, TableRegistry, TableQueryDto } from '@kkmodules/nestjs-table';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly tableQuery: TableQueryService,
    private readonly registry: TableRegistry,
  ) {}

  @Get()
  async index(@Query() query: TableQueryDto) {
    const table = this.registry.get('UsersTable');
    return this.tableQuery.execute(table, query);
  }
}
```

### Step 4: Render with the DataTable Component

```vue
<!-- src/pages/UsersPage.vue -->
<script setup lang="ts">
import { DataTable } from '@kkmodules/vue-table';
</script>

<template>
  <div class="container mx-auto py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight">Users</h1>
      <p class="text-muted-foreground">Manage your application users.</p>
    </div>

    <DataTable
      endpoint="/api/users"
      table-class="UsersTable"
      :default-per-page="15"
      :debounce="300"
      :sync-url="true"
    />
  </div>
</template>
```

That's it. The `<DataTable>` component handles:

- Fetching data from the endpoint
- Rendering columns based on the table metadata
- Search input with debounced requests
- Filter dropdowns with clause-based filtering
- Column sorting with visual indicators
- Pagination controls
- Row actions and bulk actions
- Column visibility toggles
- Export buttons
- Empty state display
- URL synchronization for shareable table states

---

## Project Structure Overview

A typical project using this module has the following structure:

```
your-project/
  backend/
    src/
      app.module.ts              # Import TableModule.forRoot()
      users/
        entities/
          user.entity.ts         # TypeORM entity
        tables/
          users.table.ts         # Table class with @TableConfig
        users.controller.ts      # Controller using TableQueryService
        users.module.ts          # Feature module
  frontend/
    src/
      pages/
        UsersPage.vue            # Page using <DataTable>
      main.ts                    # Vue app entry
    tailwind.config.ts           # Tailwind with shadcn-vue theme
```

### Backend Package Exports

The `@kkmodules/nestjs-table` package exports:

| Export              | Description                                      |
|---------------------|--------------------------------------------------|
| `TableModule`       | NestJS dynamic module                            |
| `BaseTable`         | Abstract base class for table definitions        |
| `TableConfig`       | Decorator for table configuration                |
| `TableQueryService` | Service to execute table queries                 |
| `TableRegistry`     | Injectable registry of table instances           |
| `TableQueryDto`     | DTO for query parameters                         |
| `ActionRequestDto`  | DTO for action execution requests                |
| `ExportRequestDto`  | DTO for export requests                          |
| `Action`            | Action builder class                             |
| `Export`            | Export builder class                             |
| `EmptyState`        | Empty state builder class                        |
| All column classes  | `TextColumn`, `NumericColumn`, `DateColumn`, etc. |
| All filter classes  | `TextFilter`, `SetFilter`, `DateFilter`, etc.    |
| All enums           | `PaginationType`, `SortDirection`, `Variant`, etc.|

### Frontend Package Exports

The `@kkmodules/vue-table` package exports:

| Export                | Description                                     |
|-----------------------|-------------------------------------------------|
| `DataTable`           | Main Vue component                              |
| `useTable`            | Composable for table state management           |
| `useFilters`          | Composable for filter management                |
| `useActions`          | Composable for action execution                 |
| `useExport`           | Composable for export handling                  |
| `useStickyTable`      | Composable for sticky header behavior           |
| `setIconResolver`     | Configure custom icon resolution                |
| `resolveIcon`         | Resolve an icon by name                         |
| `buildQueryString`    | Build URL query string from table state         |
| `parseFiltersFromUrl` | Parse filter state from URL parameters          |

---

## Next Steps

- [Table Configuration](./table-configuration.md) -- Learn about `@TableConfig` options and `BaseTable` methods
- [Columns](./columns.md) -- Detailed reference for every column type and method
