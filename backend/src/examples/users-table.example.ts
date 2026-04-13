import 'reflect-metadata';
import { BaseTable } from '../base-table';
import { TableConfig } from '../decorators/table-config.decorator';
import { TextColumn, DateTimeColumn, BadgeColumn, BooleanColumn, ActionColumn } from '../columns';
import { TextFilter, DateFilter, SetFilter, BooleanFilter } from '../filters';
import { Action } from '../action';
import { Export } from '../export';
import { EmptyState } from '../empty-state';
import { SortDirection, PaginationType, Variant, ExportFormat } from '../enums';

// Replace with your actual User entity
class UserEntity {
  id: number;
  name: string;
  email: string;
  status: string;
  isActive: boolean;
  createdAt: Date;
}

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
      SetFilter.make('role').options([
        { value: '1', label: 'Admin' },
        { value: '2', label: 'User' },
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
          message: 'This action cannot be undone. The user will be moved to trash.',
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
      .message('Try adjusting your search or filter criteria, or create a new user.')
      .icon('users')
      .action({ label: 'Create User', url: '/users/create' });
  }
}
