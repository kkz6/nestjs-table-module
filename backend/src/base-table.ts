import 'reflect-metadata';
import { TABLE_CONFIG_KEY } from './decorators/table-config.decorator';
import { TableConfigOptions, TableMeta } from './interfaces';
import { Column } from './columns/column';
import { Filter } from './filters/filter';
import { TrashedFilter } from './filters/trashed-filter';
import { Action } from './action';
import { Export } from './export';
import { EmptyState } from './empty-state';
import { Variant, ScrollPosition } from './enums';

export abstract class BaseTable<T> {
  private _registryName: string = '';

  // Users override these
  abstract columns(): Column[];

  filters(): Filter[] {
    return [];
  }

  actions(): Action[] {
    return [];
  }

  exports(): Export[] {
    return [];
  }

  emptyState(): EmptyState | null {
    return null;
  }

  // Read config from @TableConfig decorator
  getConfig(): TableConfigOptions {
    const config = Reflect.getMetadata(TABLE_CONFIG_KEY, this.constructor);
    if (!config) {
      throw new Error(
        `@TableConfig decorator is missing on ${this.constructor.name}`,
      );
    }
    return config;
  }

  // Registry
  setRegistryName(name: string): void {
    this._registryName = name;
  }

  getRegistryName(): string {
    return this._registryName || this.constructor.name;
  }

  // Column accessors
  getColumns(): Column[] {
    return this.columns();
  }

  getSearchableColumns(): Column[] {
    return this.columns().filter((c) => c.isSearchable());
  }

  // Filter accessors — auto-add TrashedFilter if softDeletes enabled
  getFilters(): Filter[] {
    const filters = this.filters();
    const config = this.getConfig();

    if (config.softDeletes) {
      const hasTrashedFilter = filters.some((f) => f instanceof TrashedFilter);
      if (!hasTrashedFilter) {
        filters.push(TrashedFilter.make());
      }
    }

    return filters;
  }

  // Action accessors — auto-add soft delete actions
  getRowActions(): Action[] {
    const allActions = this.actions();
    const rowActions = allActions.filter((a) => !a.isBulk());
    const config = this.getConfig();

    if (config.softDeletes) {
      // Add restore action
      const hasRestore = rowActions.some((a) => a.getName() === 'restore');
      if (!hasRestore) {
        rowActions.push(
          Action.make('restore', 'Restore')
            .asButton()
            .variant(Variant.Success)
            .confirm({
              title: 'Restore this item?',
              message: 'This will restore the item from trash.',
            })
            .handle(async (item: any, repo: any) => {
              await repo.restore(item.id);
            }),
        );
      }

      // Add force delete action
      const hasForceDelete = rowActions.some(
        (a) => a.getName() === 'forceDelete',
      );
      if (!hasForceDelete) {
        rowActions.push(
          Action.make('forceDelete', 'Force Delete')
            .asButton()
            .variant(Variant.Destructive)
            .confirm({
              title: 'Permanently delete?',
              message: 'This action cannot be undone.',
            })
            .handle(async (item: any, repo: any) => {
              await repo.delete(item.id);
            }),
        );
      }
    }

    return rowActions;
  }

  getBulkActions(): Action[] {
    return this.actions().filter((a) => a.isBulk());
  }

  getExports(): Export[] {
    return this.exports();
  }

  // Serialize to TableMeta (sent to frontend)
  toMeta(): TableMeta {
    const config = this.getConfig();
    const emptyState = this.emptyState();
    const searchableColumns = this.getSearchableColumns();
    const searchFields = config.searchable ?? [];

    const searchEnabled =
      searchableColumns.length > 0 || searchFields.length > 0;
    const searchPlaceholder = searchEnabled
      ? `Search by ${[...searchableColumns.map((c) => c.getHeader().toLowerCase()), ...searchFields].join(', ')}...`
      : '';

    return {
      columns: this.getColumns().map((c) => c.toArray()),
      filters: this.getFilters().map((f) => f.toArray()),
      actions: {
        row: this.getRowActions().map((a) => a.toArray()),
        bulk: this.getBulkActions().map((a) => a.toArray()),
      },
      exports: this.getExports().map((e) => e.toArray()),
      search: {
        enabled: searchEnabled,
        placeholder: searchPlaceholder,
      },
      perPageOptions: config.perPageOptions ?? [15, 30, 50, 100],
      softDeletes: config.softDeletes ?? false,
      stickyHeader: config.stickyHeader ?? false,
      debounce: config.debounce ?? 300,
      scrollPosition: config.scrollPosition ?? ScrollPosition.TopOfPage,
      views: [], // Views are loaded dynamically
      emptyState: emptyState?.toArray() ?? null,
    };
  }
}
