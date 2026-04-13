# NestJS Table Module

A full-stack, declarative data table module for **NestJS + Vue 3** applications. Define your table schema once on the backend and get a fully interactive, filterable, sortable, exportable data table on the frontend with zero boilerplate.

## Features

- **9 Column Types** -- Text, Numeric, Date, DateTime, Boolean, Badge, Image, Action, and base Column
- **7 Filter Types** -- Text, Numeric, Date, Boolean, Set, Trashed, and base Filter
- **24 Filter Clauses** -- Equals, Contains, StartsWith, Between, GreaterThan, In, IsTrue, WithTrashed, and more
- **Row and Bulk Actions** -- Inline buttons/links with confirmation dialogs, before/after hooks, and authorization
- **Async Exports with SSE** -- Excel (XLSX), CSV, and PDF exports with real-time progress via Server-Sent Events
- **Saved Views** -- Users can save and restore filter/sort/column configurations
- **Soft Deletes** -- Built-in trashed filter and restore/force-delete actions
- **Full Pagination** -- Full, simple, and cursor-based pagination with configurable per-page options
- **Global Search** -- Search across multiple columns with debounced input
- **Sticky Headers** -- Keep table headers visible while scrolling
- **URL Sync** -- Persist table state (page, sort, filters, search) in the URL
- **Column Toggling** -- Users can show/hide columns
- **Builder Pattern API** -- Fluent, chainable API for defining columns, filters, actions, and exports

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Backend Setup

### 1. Import TableModule

Register `TableModule.forRoot()` in your root `AppModule` and pass your table class instances:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableModule } from '@nestjs-table-module/backend';
import { UsersTable } from './tables/users.table';

@Module({
  imports: [
    TypeOrmModule.forRoot({ /* ... */ }),
    TableModule.forRoot([new UsersTable()]),
  ],
})
export class AppModule {}
```

### 2. Create a Table Class

Extend `BaseTable<T>` and use the `@TableConfig` decorator to define your table:

```typescript
import 'reflect-metadata';
import { BaseTable } from '@nestjs-table-module/backend';
import { TableConfig } from '@nestjs-table-module/backend';
import {
  TextColumn, DateTimeColumn, BadgeColumn,
  BooleanColumn, ActionColumn,
} from '@nestjs-table-module/backend';
import {
  TextFilter, DateFilter, SetFilter, BooleanFilter,
} from '@nestjs-table-module/backend';
import { Action } from '@nestjs-table-module/backend';
import { Export } from '@nestjs-table-module/backend';
import { EmptyState } from '@nestjs-table-module/backend';
import {
  SortDirection, PaginationType, Variant, ExportFormat,
} from '@nestjs-table-module/backend';
import { User } from '../entities/user.entity';

@TableConfig({
  resource: User,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
  perPageOptions: [15, 30, 50, 100],
  softDeletes: true,
  searchable: ['name', 'email'],
  stickyHeader: true,
  debounce: 300,
})
export class UsersTable extends BaseTable<User> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable().searchable(),
      BadgeColumn.make('status').variant({
        active: 'success',
        inactive: 'destructive',
        pending: 'warning',
      }).icon({
        active: 'check-circle',
        inactive: 'x-circle',
        pending: 'clock',
      }),
      BooleanColumn.make('isActive')
        .trueLabel('Active')
        .falseLabel('Inactive')
        .trueIcon('check')
        .falseIcon('x'),
      DateTimeColumn.make('createdAt').sortable().format('YYYY-MM-DD HH:mm'),
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
        .url((row: any) => `/users/${row.id}/edit`),
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
        .handle(async (item: any, repo: any) => {
          await repo.softDelete(item.id);
          return { message: 'User deleted successfully' };
        }),
      Action.make('bulkDelete', 'Delete Selected')
        .bulk()
        .variant(Variant.Destructive)
        .confirm({ title: 'Delete selected users?' })
        .handle(async (ids: string[], repo: any) => {
          await repo.softDelete(ids);
          return { message: `${ids.length} users deleted` };
        }),
    ];
  }

  exports() {
    return [
      Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx),
      Export.make('CSV', 'users.csv', ExportFormat.Csv),
      Export.make('PDF', 'users.pdf', ExportFormat.Pdf),
    ];
  }

  emptyState() {
    return EmptyState.make()
      .title('No users found')
      .message('Try adjusting your search or filter criteria.')
      .icon('users')
      .action({ label: 'Create User', url: '/users/create' });
  }
}
```

### 3. Wire into a Controller

Use `TableQueryService` to execute the table query and return the response:

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TableQueryService, TableQueryDto, TableRegistry } from '@nestjs-table-module/backend';

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private queryService: TableQueryService,
    private registry: TableRegistry,
  ) {}

  @Get()
  async index(@Query() query: TableQueryDto) {
    const table = this.registry.get('UsersTable');
    return this.queryService.execute(table, query);
  }
}
```

### @TableConfig Options

| Option | Type | Default | Description |
|---|---|---|---|
| `resource` | `Function` | *required* | TypeORM entity class |
| `defaultSort` | `{ column, direction }` | `undefined` | Default sort column and direction |
| `pagination` | `PaginationType` | `Full` | `Full`, `Simple`, or `Cursor` |
| `perPageOptions` | `number[]` | `[15, 30, 50, 100]` | Available per-page options |
| `defaultPerPage` | `number` | `15` | Default rows per page |
| `softDeletes` | `boolean` | `false` | Enable soft delete support |
| `searchable` | `string[]` | `[]` | Additional searchable field names |
| `stickyHeader` | `boolean` | `false` | Enable sticky table header |
| `debounce` | `number` | `300` | Debounce delay in ms for search/filter |
| `scrollPosition` | `ScrollPosition` | `TopOfPage` | Scroll behavior on page change |

## Frontend Setup

### 1. Use the DataTable Component

The `<DataTable>` component handles the entire table lifecycle -- fetching data, rendering columns, filtering, sorting, pagination, actions, and exports:

```vue
<script setup lang="ts">
import { DataTable } from '@nestjs-table-module/frontend';
</script>

<template>
  <DataTable
    endpoint="/api/users"
    table-class="UsersTable"
    :default-per-page="15"
    :debounce="300"
    :sync-url="true"
  />
</template>
```

### DataTable Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string` | *required* | API endpoint URL |
| `tableClass` | `string` | `''` | Backend table class name (for actions/exports) |
| `defaultPerPage` | `number` | `15` | Default rows per page |
| `debounce` | `number` | `300` | Debounce delay in ms |
| `syncUrl` | `boolean` | `true` | Sync table state to URL query params |

### 2. Using Composables Individually

For custom layouts, use the composables directly:

```typescript
import { useTable, useFilters, useActions, useExport, useStickyTable } from '@nestjs-table-module/frontend';

const {
  data, meta, pagination, isLoading, isEmpty,
  sortColumn, sortDirection, search, activeFilters, visibleColumns,
  setPage, setPerPage, setSort, setSearch,
  addFilter, removeFilter, updateFilter, toggleColumn, refresh,
} = useTable('/api/users', {
  defaultPerPage: 15,
  debounce: 300,
  syncUrl: true,
});

const { selectedIds, hasSelection, selectedCount, confirmAction,
  toggleSelect, toggleSelectAll, executeAction, cancelAction,
} = useActions();

const { isExporting, exportProgress, triggerExport } = useExport();

const { tableRef, headerStuck } = useStickyTable();
```

### 3. Icon Resolver

Configure a custom icon resolver to map icon names to your icon library:

```typescript
import { setIconResolver } from '@nestjs-table-module/frontend';

// Example: resolve to Lucide icon component names
setIconResolver((name: string) => `Lucide${name.charAt(0).toUpperCase() + name.slice(1)}`);
```

## API Reference

### Column Types

All columns extend the base `Column` class and share these chainable methods:

| Method | Description |
|---|---|
| `.sortable()` | Enable sorting on this column |
| `.searchable()` | Include this column in global search |
| `.toggleable()` / `.notToggleable()` | Allow users to show/hide this column |
| `.visible()` / `.hidden()` | Set initial visibility |
| `.align(ColumnAlignment)` | Set alignment (`Left`, `Center`, `Right`) |
| `.leftAligned()` / `.centerAligned()` / `.rightAligned()` | Alignment shortcuts |
| `.wrap()` | Enable text wrapping |
| `.truncate(lines)` | Truncate text to N lines |
| `.headerClass(css)` | Custom CSS class for the header cell |
| `.cellClass(css)` | Custom CSS class for data cells |
| `.stickable()` | Enable sticky column support |
| `.meta(data)` | Attach arbitrary metadata |
| `.mapAs(fn \| map)` | Transform display value via function or lookup map |
| `.exportAs(fn)` / `.dontExport()` | Customize export value or exclude from export |
| `.sortUsing(fn)` | Custom sort query function |

#### TextColumn

```typescript
TextColumn.make('name').sortable().searchable()
TextColumn.make('department.name', 'Department') // nested relation
```

#### NumericColumn

```typescript
NumericColumn.make('price').sortable().rightAligned()
```

#### DateColumn

```typescript
DateColumn.make('birthDate').sortable().format('DD/MM/YYYY')
// Static default: DateColumn.setDefaultFormat('YYYY-MM-DD')
```

#### DateTimeColumn

```typescript
DateTimeColumn.make('createdAt').sortable().format('YYYY-MM-DD HH:mm')
// Static default: DateTimeColumn.setDefaultFormat('YYYY-MM-DD HH:mm:ss')
```

#### BooleanColumn

```typescript
BooleanColumn.make('isActive')
  .trueLabel('Active').falseLabel('Inactive')
  .trueIcon('check').falseIcon('x')
// Static defaults: BooleanColumn.setDefaultTrueLabel('Yes')
```

#### BadgeColumn

```typescript
BadgeColumn.make('status')
  .variant({ active: 'success', inactive: 'destructive', pending: 'warning' })
  .icon({ active: 'check-circle', inactive: 'x-circle', pending: 'clock' })

// Or use functions for dynamic resolution:
BadgeColumn.make('status')
  .variant((value, item) => value === 'active' ? 'success' : 'default')
  .icon((value) => value === 'active' ? 'check-circle' : null)
```

#### ImageColumn

```typescript
ImageColumn.make('avatar')
  .size(ImageSize.Medium)       // Small, Medium, Large, ExtraLarge, Custom
  .position(ImagePosition.Start) // Start, End
  .fallback('/placeholder.png')
  .rounded()
```

#### ActionColumn

```typescript
ActionColumn.make()              // Always right-aligned, not toggleable, not exported
ActionColumn.make('Actions')     // Custom header text
ActionColumn.make().asDropdown() // Render actions as a dropdown menu
// Static default: ActionColumn.defaultAsDropdown(true)
```

### Filter Types

All filters extend the base `Filter` class and share these chainable methods:

| Method | Description |
|---|---|
| `.clauses(clauses)` | Override the default set of clauses |
| `.nullable()` | Add `IsSet` and `IsNotSet` clauses |
| `.default(value, clause?)` | Set a default filter value |
| `.applyUsing(fn)` | Custom query builder function |
| `.hidden()` | Hide the filter from the UI |

#### TextFilter

Default clauses: `Contains`, `NotContains`, `StartsWith`, `EndsWith`, `NotStartsWith`, `NotEndsWith`, `Equals`, `NotEquals`

```typescript
TextFilter.make('name')
TextFilter.make('email').clauses([Clause.Contains, Clause.Equals])
```

#### NumericFilter

Default clauses: `Equals`, `NotEquals`, `GreaterThan`, `GreaterThanOrEqual`, `LessThan`, `LessThanOrEqual`, `Between`, `NotBetween`

```typescript
NumericFilter.make('price')
NumericFilter.make('age').default(18, Clause.GreaterThanOrEqual)
```

#### DateFilter

Default clauses: `Before`, `After`, `EqualOrBefore`, `EqualOrAfter`, `Equals`, `NotEquals`, `Between`, `NotBetween`

```typescript
DateFilter.make('createdAt')
DateFilter.make('startDate').clauses([Clause.After, Clause.Before, Clause.Between])
```

#### BooleanFilter

Default clauses: `IsTrue`, `IsFalse`

```typescript
BooleanFilter.make('isActive')
BooleanFilter.make('isVerified').default(true)
```

#### SetFilter

Default clauses: `In`, `NotIn`, `Equals`, `NotEquals`

```typescript
SetFilter.make('status').options([
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
])

// Object syntax:
SetFilter.make('role').options({ admin: 'Admin', user: 'User' })

// Single-select mode:
SetFilter.make('category').multiple(false).withoutClause()
```

#### TrashedFilter

Automatically added when `softDeletes: true` is set in `@TableConfig`. Options: `Without trashed`, `With trashed`, `Only trashed`.

```typescript
// Manual usage:
TrashedFilter.make()
TrashedFilter.make('deleted', 'Deleted Items') // custom attribute and label
```

### All 24 Clauses

| Category | Clauses |
|---|---|
| **Text** | `Equals`, `NotEquals`, `StartsWith`, `EndsWith`, `NotStartsWith`, `NotEndsWith`, `Contains`, `NotContains` |
| **Boolean** | `IsTrue`, `IsFalse`, `IsSet`, `IsNotSet` |
| **Date** | `Before`, `EqualOrBefore`, `After`, `EqualOrAfter`, `Between`, `NotBetween` |
| **Numeric** | `GreaterThan`, `GreaterThanOrEqual`, `LessThan`, `LessThanOrEqual` |
| **Set** | `In`, `NotIn` |
| **Trashed** | `WithTrashed`, `OnlyTrashed`, `WithoutTrashed` |

### Action Builder

```typescript
Action.make('name', 'Label')
  .asButton()                    // or .asLink()
  .variant(Variant.Destructive)  // Default, Info, Success, Warning, Destructive, Secondary, Outline, Ghost, Link
  .icon('trash')
  .confirm({
    title: 'Are you sure?',
    message: 'This cannot be undone.',
    confirmLabel: 'Yes, delete',
    cancelLabel: 'Cancel',
  })
  .handle(async (item, repo) => {
    await repo.softDelete(item.id);
    return { message: 'Deleted' };
  })
  .before(async (item) => { /* pre-action hook */ })
  .after(async (item, result) => { /* post-action hook */ })
  .authorize((user) => user.isAdmin)
  .disabled((item) => item.status === 'locked')
  .hidden((item) => item.status === 'archived')
  .url((item) => `/items/${item.id}/edit`)
  .download()
  .bulk()                        // Mark as a bulk action
  .meta({ key: 'value' })
  .dataAttributes({ 'test-id': 'delete-btn' })
```

### Export Builder

```typescript
Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx)
  .label('Export as Excel')
  .authorize((user) => user.canExport)
  .filteredOnly()   // Export only filtered results (default: true)
  .selectedOnly()   // Export only selected rows
```

Supported formats: `ExportFormat.Xlsx`, `ExportFormat.Csv`, `ExportFormat.Pdf`

### EmptyState Builder

```typescript
EmptyState.make()
  .title('No users found')
  .message('Try adjusting your search or filter criteria.')
  .icon('users')
  .action({ label: 'Create User', url: '/users/create' })
```

## REST API Endpoints

The module registers these endpoints automatically when `TableModule.forRoot()` is imported:

### Table Actions

```
POST /table/action/:tableClass/:actionName
Body: { id: string } or { ids: string[] }
```

Executes a row or bulk action on the specified table.

### Exports

```
POST   /table/export/:tableClass/:exportName?page=&limit=&sort=&search=&filters=
```

Triggers an async export job. Returns `{ jobId: string }`.

```
GET    /table/export/stream/:jobId
```

SSE stream for export progress. Emits progress events during processing.

```
GET    /table/export/download/:jobId
```

Downloads the completed export file.

### Saved Views

```
GET    /table/views/:tableClass
```

List all saved views for the current user and table.

```
POST   /table/views/:tableClass
Body: { title: string, requestPayload: object }
```

Save a new view (filter/sort/column configuration).

```
DELETE /table/views/:tableClass/:id
```

Delete a saved view.

## Response Contract

All table endpoints return a consistent JSON structure:

```json
{
  "meta": {
    "columns": [
      {
        "type": "text",
        "key": "name",
        "header": "Name",
        "sortable": true,
        "searchable": true,
        "toggleable": true,
        "visible": true,
        "alignment": "left",
        "wrap": false,
        "truncate": false,
        "headerClass": null,
        "cellClass": null,
        "stickable": false,
        "meta": null
      }
    ],
    "filters": [
      {
        "key": "name",
        "label": "Name",
        "type": "text",
        "clauses": ["contains", "not_contains", "starts_with", "ends_with", "equals", "not_equals"],
        "default": null
      },
      {
        "key": "status",
        "label": "Status",
        "type": "set",
        "clauses": ["in", "not_in", "equals", "not_equals"],
        "options": [
          { "value": "active", "label": "Active" },
          { "value": "inactive", "label": "Inactive" }
        ],
        "multiple": true,
        "default": null
      }
    ],
    "actions": {
      "row": [
        {
          "name": "edit",
          "label": "Edit",
          "type": "link",
          "variant": "default",
          "icon": "pencil",
          "confirm": null,
          "download": false,
          "meta": null,
          "dataAttributes": null
        }
      ],
      "bulk": []
    },
    "exports": [
      {
        "name": "Excel",
        "label": "Excel",
        "fileName": "users.xlsx",
        "format": "xlsx"
      }
    ],
    "search": {
      "enabled": true,
      "placeholder": "Search by name, email..."
    },
    "perPageOptions": [15, 30, 50, 100],
    "softDeletes": true,
    "stickyHeader": true,
    "debounce": 300,
    "scrollPosition": "topOfPage",
    "views": [],
    "emptyState": {
      "title": "No users found",
      "message": "Try adjusting your search or filter criteria.",
      "icon": "users",
      "action": { "label": "Create User", "url": "/users/create" }
    }
  },
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "status": { "value": "active", "variant": "success", "icon": "check-circle" },
      "isActive": true,
      "createdAt": "2025-01-15 09:30",
      "_actions": [
        {
          "name": "edit",
          "label": "Edit",
          "type": "link",
          "variant": "default",
          "icon": "pencil",
          "url": "/users/1/edit",
          "disabled": false,
          "hidden": false
        }
      ]
    }
  ],
  "pagination": {
    "type": "full",
    "currentPage": 1,
    "lastPage": 5,
    "perPage": 15,
    "total": 73,
    "from": 1,
    "to": 15
  }
}
```

### Query Parameters

| Parameter | Example | Description |
|---|---|---|
| `page` | `1` | Current page number |
| `limit` | `15` | Rows per page |
| `sort` | `name:asc` | Sort column and direction |
| `search` | `john` | Global search term |
| `filters[name][contains]` | `doe` | Filter by column, clause, and value |
| `columns` | `name,email,status` | Visible column keys |

## Tech Stack

### Backend

- **NestJS** -- modular Node.js framework
- **TypeORM** -- database ORM with query builder, soft deletes, and relations
- **class-validator / class-transformer** -- DTO validation and transformation
- **ExcelJS** -- XLSX and CSV export generation
- **PDFKit** -- PDF export generation

### Frontend

- **Vue 3** -- Composition API with `<script setup>`
- **shadcn-vue** -- Accessible, unstyled UI component primitives
- **Tailwind CSS** -- Utility-first CSS framework
- **TypeScript** -- End-to-end type safety

## Project Structure

```
nestjs-table-module/
  backend/
    src/
      columns/         # 9 column type classes
      filters/         # 7 filter type classes
      controllers/     # Action, Export, View controllers
      services/        # TableQuery, Export, View, SSE services
      decorators/      # @TableConfig decorator
      dto/             # TableQueryDto, ActionRequestDto, etc.
      entities/        # TableView, ExportJob TypeORM entities
      enums/           # All enums (Clause, Variant, ExportFormat, etc.)
      interfaces/      # TypeScript interfaces
      action.ts        # Action builder
      export.ts        # Export builder
      empty-state.ts   # EmptyState builder
      base-table.ts    # Abstract BaseTable class
      table-registry.ts
      table.module.ts  # NestJS DynamicModule
      index.ts         # Barrel export
  frontend/
    src/
      components/      # DataTable, cells, filters, actions, pagination
      composables/     # useTable, useFilters, useActions, useExport, useStickyTable
      types/           # TypeScript type definitions
      utils/           # Icon resolver, URL helpers
      lib/             # shadcn-vue utilities
      index.ts         # Barrel export
```

## License

MIT
