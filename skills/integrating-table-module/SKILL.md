---
name: integrating-table-module
description: Use when setting up the table module in a new NestJS project for the first time — covers installation, module registration, entity setup, and frontend configuration
---

# Integrating the Table Module

## Overview

One-time setup to add the table module to a NestJS + Vue project based on the brocoders/nestjs-boilerplate.

## Backend Setup

### 1. Install

```bash
npm install @kkmodules/nestjs-table
```

### 2. Register Module

```typescript
// src/app.module.ts
import { TableModule } from '@kkmodules/nestjs-table';

@Module({
  imports: [
    // ... existing imports
    TableModule.forRoot(),
  ],
})
export class AppModule {}
```

### 3. Add Entities to TypeORM

The module uses 2 entities (`TableViewEntity`, `ExportJobEntity`). They're auto-registered via `TypeOrmModule.forFeature()` inside `TableModule`. Ensure your TypeORM config auto-syncs or run migrations:

```sql
CREATE TABLE table_views (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER,
  "tableClass" VARCHAR NOT NULL,
  "tableName" VARCHAR,
  title VARCHAR NOT NULL,
  "requestPayload" JSONB NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tableClass" VARCHAR NOT NULL,
  "exportName" VARCHAR NOT NULL,
  "fileName" VARCHAR NOT NULL,
  format VARCHAR NOT NULL,
  "queryState" JSONB NOT NULL,
  "selectedIds" TEXT,
  status VARCHAR DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  "filePath" VARCHAR,
  "userId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### 4. Inject TableQueryService

In any controller that serves table data:

```typescript
import { TableQueryService, TableQueryDto } from '@kkmodules/nestjs-table';

@Controller('api/orders')
export class OrdersController {
  constructor(
    private tableQuery: TableQueryService,
    private ordersTable: OrdersTable,
  ) {}

  @Get()
  async findAll(@Query() query: TableQueryDto) {
    return this.tableQuery.execute(this.ordersTable, query);
  }
}
```

## Frontend Setup

### 1. Install

```bash
npm install @kkmodules/vue-table
```

### 2. Import Styles

```typescript
// main.ts or main.css
import '@kkmodules/vue-table/style.css';
```

### 3. Tailwind Config

Add the module's components to your Tailwind content paths:

```typescript
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{vue,ts}',
    './node_modules/@kkmodules/vue-table/dist/**/*.{js,mjs}',
  ],
  // ...
};
```

### 4. Use DataTable

```vue
<template>
  <DataTable endpoint="/api/orders" table-class="OrdersTable" />
</template>

<script setup>
import { DataTable } from '@kkmodules/vue-table';
</script>
```

## DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `endpoint` | `string` | required | API URL to fetch table data |
| `tableClass` | `string` | `''` | Table registry name (for actions/exports) |
| `defaultPerPage` | `number` | `15` | Initial rows per page |
| `debounce` | `number` | `300` | Debounce delay (ms) for search/filters |
| `syncUrl` | `boolean` | `true` | Sync table state to URL query params |

## Checklist

- [ ] `TableModule.forRoot()` in AppModule imports
- [ ] TypeORM entities synced / migrations run
- [ ] Table class created extending `BaseTable`
- [ ] Table class registered as provider in feature module
- [ ] Controller uses `TableQueryService.execute()`
- [ ] Frontend: `@kkmodules/vue-table` installed
- [ ] Frontend: styles imported
- [ ] Frontend: Tailwind content paths updated
- [ ] Frontend: `<DataTable>` component used with correct endpoint
