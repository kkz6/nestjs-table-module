# Soft Deletes

The table module has built-in support for TypeORM soft deletes. When enabled, trashed records can be filtered, restored, and permanently deleted through the table UI.

## Enabling Soft Deletes

Set `softDeletes: true` in the `@TableConfig` decorator:

```typescript
@TableConfig({
  resource: UserEntity,
  softDeletes: true,
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable(),
      DateTimeColumn.make('createdAt').sortable(),
      ActionColumn.make(),
    ];
  }
}
```

## TypeORM Entity Requirement

Your entity must use TypeORM's `@DeleteDateColumn` decorator:

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, DeleteDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;  // Required for soft deletes
}
```

TypeORM automatically excludes records where `deletedAt` is not null from normal queries. The table module's soft delete features build on this behavior.

## What Gets Auto-Added

When `softDeletes: true` is set, the `BaseTable` class automatically adds the following to your table:

### 1. TrashedFilter

A `SetFilter` that allows users to control which records are visible:

| Option            | Label             | Behavior                                              |
|-------------------|-------------------|-------------------------------------------------------|
| `without_trashed` | Without trashed   | Default. Only shows non-deleted records.              |
| `with_trashed`    | With trashed      | Shows all records, including soft-deleted ones.       |
| `only_trashed`    | Only trashed      | Shows only soft-deleted records.                      |

The filter is appended to the `getFilters()` result automatically. If you already have a `TrashedFilter` in your `filters()` method, it will not be duplicated.

### 2. Restore Action

A row action named `restore` that restores a soft-deleted record:

```typescript
Action.make('restore', 'Restore')
  .asButton()
  .variant(Variant.Success)
  .confirm({
    title: 'Restore this item?',
    message: 'This will restore the item from trash.',
  })
  .handle(async (item, repo) => {
    await repo.restore(item.id);
  })
```

### 3. Force Delete Action

A row action named `forceDelete` that permanently deletes a record:

```typescript
Action.make('forceDelete', 'Force Delete')
  .asButton()
  .variant(Variant.Destructive)
  .confirm({
    title: 'Permanently delete?',
    message: 'This action cannot be undone.',
  })
  .handle(async (item, repo) => {
    await repo.delete(item.id);
  })
```

Both actions require confirmation before executing.

## How the TrashedFilter Modifies Queries

The `TrashedFilter` extends `SetFilter` and uses a custom `applyUsing` callback that modifies the TypeORM query builder:

| Value              | Query Modification                                                    |
|--------------------|-----------------------------------------------------------------------|
| `without_trashed`  | No-op. TypeORM excludes soft-deleted records by default.              |
| `with_trashed`     | Calls `qb.withDeleted()` to include soft-deleted records.            |
| `only_trashed`     | Calls `qb.withDeleted()` then `qb.andWhere('entity.deletedAt IS NOT NULL')`. |

The filter is configured with `withoutClause()`, meaning it does not use the standard clause dropdown -- it simply presents the three radio-style options.

## Customizing Soft Delete Actions

If you want to customize the restore or force delete behavior, define them explicitly in your `actions()` method:

```typescript
actions() {
  return [
    // Your custom restore action
    Action.make('restore', 'Undo Delete')
      .asButton()
      .variant(Variant.Success)
      .icon('undo')
      .confirm({
        title: 'Restore user?',
        message: 'The user account will be reactivated.',
        confirmLabel: 'Restore',
      })
      .handle(async (item, repo) => {
        await repo.restore(item.id);
        // Additional logic: send reactivation email, audit log, etc.
      }),

    // Your custom force delete action
    Action.make('forceDelete', 'Permanently Remove')
      .asButton()
      .variant(Variant.Destructive)
      .icon('trash-2')
      .confirm({
        title: 'Permanently delete this user?',
        message: 'All user data will be permanently removed. This cannot be undone.',
        confirmLabel: 'Delete Permanently',
        cancelLabel: 'Keep',
      })
      .handle(async (item, repo) => {
        // Clean up related data first
        await repo.delete(item.id);
      }),
  ];
}
```

The `BaseTable.getRowActions()` method checks for existing actions named `restore` and `forceDelete`. If they already exist, the auto-generated versions are skipped.

## Customizing the TrashedFilter

Similarly, if you include a `TrashedFilter` in your `filters()` array, the auto-added one is skipped:

```typescript
import { TrashedFilter } from '@nestjs-table-module/backend';

filters() {
  return [
    TextFilter.make('name'),
    TrashedFilter.make('trashed', 'Record Status'),
  ];
}
```

## Complete Example

```typescript
@TableConfig({
  resource: UserEntity,
  softDeletes: true,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
})
export class UsersTable extends BaseTable<UserEntity> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable().searchable(),
      BadgeColumn.make('status'),
      DateTimeColumn.make('createdAt').sortable(),
      ActionColumn.make(),
    ];
  }

  filters() {
    return [
      TextFilter.make('name'),
      SetFilter.make('status').options([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]),
      // TrashedFilter is auto-added because softDeletes: true
    ];
  }

  actions() {
    return [
      Action.make('edit', 'Edit')
        .asLink()
        .url((row) => `/users/${row.id}/edit`),
      Action.make('delete', 'Delete')
        .asButton()
        .variant(Variant.Destructive)
        .confirm({
          title: 'Delete user?',
          message: 'The user will be moved to trash.',
        })
        .handle(async (item, repo) => {
          await repo.softDelete(item.id);
        }),
      // restore and forceDelete are auto-added because softDeletes: true
    ];
  }
}
```

With this setup, the table automatically has:

- A "Trashed" filter dropdown with "Without trashed", "With trashed", and "Only trashed" options.
- "Restore" and "Force Delete" buttons on each row when viewing trashed records.
- The "Delete" action moves records to trash (soft delete).
