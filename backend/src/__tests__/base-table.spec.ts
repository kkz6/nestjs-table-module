import 'reflect-metadata';
import { BaseTable } from '../base-table';
import { TableConfig } from '../decorators/table-config.decorator';
import { TextColumn, ActionColumn } from '../columns';
import { TextFilter, BooleanFilter } from '../filters';
import { TrashedFilter } from '../filters/trashed-filter';
import { Action } from '../action';
import { Export } from '../export';
import { EmptyState } from '../empty-state';
import {
  SortDirection,
  PaginationType,
  Variant,
  ExportFormat,
  ScrollPosition,
} from '../enums';

class FakeEntity {}

@TableConfig({
  resource: FakeEntity,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
  perPageOptions: [10, 25, 50],
  softDeletes: true,
  searchable: ['name'],
  stickyHeader: true,
  debounce: 500,
  scrollPosition: ScrollPosition.TopOfTable,
})
class TestTable extends BaseTable<any> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable(),
      ActionColumn.make(),
    ];
  }

  filters() {
    return [TextFilter.make('name'), BooleanFilter.make('isActive')];
  }

  actions() {
    return [
      Action.make('edit').asLink(),
      Action.make('delete').asButton().variant(Variant.Destructive),
      Action.make('bulkDelete').bulk(),
    ];
  }

  exports() {
    return [Export.make('CSV', 'test.csv', ExportFormat.Csv)];
  }

  emptyState() {
    return EmptyState.make().title('No data').message('Nothing here');
  }
}

class NoConfigTable extends BaseTable<any> {
  columns() {
    return [];
  }
}

describe('BaseTable', () => {
  let table: TestTable;

  beforeEach(() => {
    table = new TestTable();
  });

  describe('getConfig()', () => {
    it('reads decorator metadata correctly', () => {
      const config = table.getConfig();
      expect(config.resource).toBe(FakeEntity);
      expect(config.defaultSort).toEqual({
        column: 'createdAt',
        direction: SortDirection.Desc,
      });
      expect(config.pagination).toBe(PaginationType.Full);
      expect(config.perPageOptions).toEqual([10, 25, 50]);
      expect(config.softDeletes).toBe(true);
      expect(config.searchable).toEqual(['name']);
      expect(config.stickyHeader).toBe(true);
      expect(config.debounce).toBe(500);
      expect(config.scrollPosition).toBe(ScrollPosition.TopOfTable);
    });

    it('throws if decorator is missing', () => {
      const noConfig = new NoConfigTable();
      expect(() => noConfig.getConfig()).toThrow(
        '@TableConfig decorator is missing on NoConfigTable',
      );
    });
  });

  describe('getColumns()', () => {
    it('returns all columns', () => {
      const columns = table.getColumns();
      expect(columns).toHaveLength(3);
      expect(columns[0].getAttribute()).toBe('name');
      expect(columns[1].getAttribute()).toBe('email');
      expect(columns[2].getAttribute()).toBe('_actions');
    });
  });

  describe('getSearchableColumns()', () => {
    it('returns only searchable columns', () => {
      const searchable = table.getSearchableColumns();
      expect(searchable).toHaveLength(1);
      expect(searchable[0].getAttribute()).toBe('name');
    });
  });

  describe('getFilters()', () => {
    it('auto-adds TrashedFilter when softDeletes is true', () => {
      const filters = table.getFilters();
      const trashedFilter = filters.find((f) => f instanceof TrashedFilter);
      expect(trashedFilter).toBeDefined();
      expect(filters.length).toBe(3); // TextFilter + BooleanFilter + auto TrashedFilter
    });

    it('does NOT duplicate TrashedFilter if already defined', () => {
      @TableConfig({
        resource: FakeEntity,
        softDeletes: true,
      })
      class TableWithTrashed extends BaseTable<any> {
        columns() {
          return [];
        }
        filters() {
          return [TrashedFilter.make()];
        }
      }

      const t = new TableWithTrashed();
      const filters = t.getFilters();
      const trashedFilters = filters.filter(
        (f) => f instanceof TrashedFilter,
      );
      expect(trashedFilters).toHaveLength(1);
    });
  });

  describe('getRowActions()', () => {
    it('filters out bulk actions', () => {
      const rowActions = table.getRowActions();
      const bulkAction = rowActions.find((a) => a.getName() === 'bulkDelete');
      expect(bulkAction).toBeUndefined();
    });

    it('adds restore and forceDelete actions for softDeletes', () => {
      const rowActions = table.getRowActions();
      const restoreAction = rowActions.find((a) => a.getName() === 'restore');
      const forceDeleteAction = rowActions.find(
        (a) => a.getName() === 'forceDelete',
      );
      expect(restoreAction).toBeDefined();
      expect(forceDeleteAction).toBeDefined();
    });

    it('includes user-defined row actions', () => {
      const rowActions = table.getRowActions();
      const editAction = rowActions.find((a) => a.getName() === 'edit');
      const deleteAction = rowActions.find((a) => a.getName() === 'delete');
      expect(editAction).toBeDefined();
      expect(deleteAction).toBeDefined();
    });
  });

  describe('getBulkActions()', () => {
    it('returns only bulk actions', () => {
      const bulkActions = table.getBulkActions();
      expect(bulkActions).toHaveLength(1);
      expect(bulkActions[0].getName()).toBe('bulkDelete');
    });
  });

  describe('getExports()', () => {
    it('returns exports', () => {
      const exports = table.getExports();
      expect(exports).toHaveLength(1);
      expect(exports[0].getName()).toBe('CSV');
    });
  });

  describe('toMeta()', () => {
    it('serializes complete TableMeta with correct structure', () => {
      const meta = table.toMeta();

      // columns
      expect(meta.columns).toHaveLength(3);
      expect(meta.columns[0].key).toBe('name');
      expect(meta.columns[1].key).toBe('email');
      expect(meta.columns[2].key).toBe('_actions');

      // filters — 2 user-defined + 1 auto TrashedFilter
      expect(meta.filters).toHaveLength(3);

      // actions
      expect(meta.actions.row.length).toBeGreaterThanOrEqual(2); // edit, delete + restore, forceDelete
      expect(meta.actions.bulk).toHaveLength(1);

      // exports
      expect(meta.exports).toHaveLength(1);
      expect(meta.exports[0].name).toBe('CSV');

      // config values
      expect(meta.perPageOptions).toEqual([10, 25, 50]);
      expect(meta.softDeletes).toBe(true);
      expect(meta.stickyHeader).toBe(true);
      expect(meta.debounce).toBe(500);
      expect(meta.scrollPosition).toBe(ScrollPosition.TopOfTable);
      expect(meta.views).toEqual([]);

      // emptyState
      expect(meta.emptyState).toBeDefined();
      expect(meta.emptyState!.title).toBe('No data');
      expect(meta.emptyState!.message).toBe('Nothing here');
    });

    it('search.enabled is true and placeholder includes searchable column names', () => {
      const meta = table.toMeta();
      expect(meta.search.enabled).toBe(true);
      // "name" from searchable column + "name" from config.searchable
      expect(meta.search.placeholder).toContain('name');
      expect(meta.search.placeholder).toMatch(/^Search by .+\.\.\.$/);
    });

    it('uses defaults when config values are not specified', () => {
      @TableConfig({
        resource: FakeEntity,
      })
      class MinimalTable extends BaseTable<any> {
        columns() {
          return [];
        }
      }

      const t = new MinimalTable();
      const meta = t.toMeta();

      expect(meta.perPageOptions).toEqual([15, 30, 50, 100]);
      expect(meta.softDeletes).toBe(false);
      expect(meta.stickyHeader).toBe(false);
      expect(meta.debounce).toBe(300);
      expect(meta.scrollPosition).toBe(ScrollPosition.TopOfPage);
      expect(meta.emptyState).toBeNull();
      expect(meta.search.enabled).toBe(false);
      expect(meta.search.placeholder).toBe('');
    });
  });

  describe('registry name', () => {
    it('defaults to class name', () => {
      expect(table.getRegistryName()).toBe('TestTable');
    });

    it('can be set via setRegistryName', () => {
      table.setRegistryName('customName');
      expect(table.getRegistryName()).toBe('customName');
    });
  });
});
