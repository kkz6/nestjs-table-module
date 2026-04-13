import 'reflect-metadata';
import { TableQueryService } from '../table-query.service';
import { BaseTable } from '../../base-table';
import { TableConfig } from '../../decorators/table-config.decorator';
import { TextColumn, BadgeColumn, ActionColumn } from '../../columns';
import { TextFilter, BooleanFilter } from '../../filters';
import { Action } from '../../action';
import { SortDirection, PaginationType, Variant } from '../../enums';

class FakeEntity {
  id: number;
  name: string;
  email: string;
  status: string;
}

@TableConfig({
  resource: FakeEntity,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
  searchable: ['name', 'email'],
})
class TestTable extends BaseTable<FakeEntity> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable(),
      BadgeColumn.make('status').variant({ active: 'success' }),
      ActionColumn.make(),
    ];
  }
  filters() {
    return [TextFilter.make('name'), BooleanFilter.make('isActive')];
  }
  actions() {
    return [Action.make('edit').asLink()];
  }
}

function createMockQb(mockData: any[] = [], mockCount: number = 0) {
  const qb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(mockData),
    getCount: jest.fn().mockResolvedValue(mockCount),
    withDeleted: jest.fn().mockReturnThis(),
  };
  return qb;
}

function createMockDataSource(qb: any) {
  return {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    }),
  } as any;
}

describe('TableQueryService', () => {
  let service: TableQueryService;
  let table: TestTable;
  let qb: any;
  let ds: any;

  beforeEach(() => {
    table = new TestTable();
    qb = createMockQb([], 0);
    ds = createMockDataSource(qb);
    service = new TableQueryService(ds);
  });

  // ─── execute() basic flow ──────────────────────────────────────────

  describe('execute() basic flow', () => {
    it('returns { meta, data, pagination } structure', async () => {
      const result = await service.execute(table, { page: 1, limit: 15 });
      expect(result).toHaveProperty('meta');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
    });

    it('meta contains columns, filters, actions, search, perPageOptions', async () => {
      const result = await service.execute(table, { page: 1, limit: 15 });
      expect(result.meta).toHaveProperty('columns');
      expect(result.meta).toHaveProperty('filters');
      expect(result.meta).toHaveProperty('actions');
      expect(result.meta).toHaveProperty('search');
      expect(result.meta).toHaveProperty('perPageOptions');
    });

    it('data is transformed through column mappers', async () => {
      const mockData = [{ id: 1, name: 'Alice', email: 'alice@test.com', status: 'active' }];
      qb.getMany.mockResolvedValue(mockData);
      qb.getCount.mockResolvedValue(1);

      const result = await service.execute(table, { page: 1, limit: 15 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('id', 1);
      expect(result.data[0]).toHaveProperty('name', 'Alice');
      expect(result.data[0]).toHaveProperty('email', 'alice@test.com');
      // BadgeColumn returns enriched object
      expect(result.data[0]).toHaveProperty('status');
      expect(result.data[0].status).toEqual({
        value: 'active',
        variant: 'success',
        icon: null,
      });
    });

    it('pagination has correct currentPage, lastPage, total, from, to', async () => {
      qb.getCount.mockResolvedValue(45);
      qb.getMany.mockResolvedValue(
        Array.from({ length: 15 }, (_, i) => ({ id: i + 1, name: `User${i}`, email: `u${i}@test.com`, status: 'active' })),
      );

      const result = await service.execute(table, { page: 1, limit: 15 });

      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.lastPage).toBe(3);
      expect(result.pagination.total).toBe(45);
      expect(result.pagination.from).toBe(1);
      expect(result.pagination.to).toBe(15);
    });
  });

  // ─── Search ────────────────────────────────────────────────────────

  describe('search', () => {
    it('calls qb.andWhere with ILIKE conditions for searchable columns when search is provided', async () => {
      await service.execute(table, { page: 1, limit: 15, search: 'alice' });

      expect(qb.andWhere).toHaveBeenCalled();
      const call = qb.andWhere.mock.calls.find((c: any[]) =>
        typeof c[0] === 'string' && c[0].includes('ILIKE'),
      );
      expect(call).toBeDefined();
      expect(call[0]).toContain('ILIKE');
    });

    it('does NOT call andWhere for search when query.search is undefined', async () => {
      await service.execute(table, { page: 1, limit: 15 });

      // andWhere should not have been called with ILIKE
      const ilikeCalls = qb.andWhere.mock.calls.filter((c: any[]) =>
        typeof c[0] === 'string' && c[0].includes('ILIKE'),
      );
      expect(ilikeCalls).toHaveLength(0);
    });

    it('does NOT call andWhere for search when query.search is empty string', async () => {
      await service.execute(table, { page: 1, limit: 15, search: '' });

      const ilikeCalls = qb.andWhere.mock.calls.filter((c: any[]) =>
        typeof c[0] === 'string' && c[0].includes('ILIKE'),
      );
      expect(ilikeCalls).toHaveLength(0);
    });

    it('search includes both searchable columns AND config.searchable fields', async () => {
      await service.execute(table, { page: 1, limit: 15, search: 'test' });

      // TestTable has: column 'name' (searchable), config.searchable: ['name', 'email']
      // Combined: name (column) + name (config) + email (config) = 3 searchable fields
      const call = qb.andWhere.mock.calls.find((c: any[]) =>
        typeof c[0] === 'string' && c[0].includes('ILIKE'),
      );
      expect(call).toBeDefined();
      // Should have search params for each searchable field
      const condition = call[0] as string;
      expect(condition).toContain('entity.name');
      expect(condition).toContain('entity.email');
    });
  });

  // ─── Filters ───────────────────────────────────────────────────────

  describe('filters', () => {
    it('applies matching filters when query.filters is provided', async () => {
      const handleSpy = jest.spyOn(TextFilter.prototype, 'handle');

      await service.execute(table, {
        page: 1,
        limit: 15,
        filters: { name: { contains: 'bob' } },
      });

      expect(handleSpy).toHaveBeenCalled();
      handleSpy.mockRestore();
    });

    it('skips unknown filter keys (not defined on table)', async () => {
      const handleSpy = jest.spyOn(TextFilter.prototype, 'handle');

      await service.execute(table, {
        page: 1,
        limit: 15,
        filters: { unknownField: { contains: 'bob' } },
      });

      expect(handleSpy).not.toHaveBeenCalled();
      handleSpy.mockRestore();
    });

    it('skips clauses not in filter getClauses()', async () => {
      const handleSpy = jest.spyOn(BooleanFilter.prototype, 'handle');

      // BooleanFilter only has is_true and is_false, not 'contains'
      await service.execute(table, {
        page: 1,
        limit: 15,
        filters: { isActive: { contains: 'anything' } },
      });

      expect(handleSpy).not.toHaveBeenCalled();
      handleSpy.mockRestore();
    });

    it('calls filter.handle() for valid filter+clause combinations', async () => {
      const handleSpy = jest.spyOn(BooleanFilter.prototype, 'handle');

      await service.execute(table, {
        page: 1,
        limit: 15,
        filters: { isActive: { is_true: '' } },
      });

      expect(handleSpy).toHaveBeenCalledWith(qb, 'is_true', null);
      handleSpy.mockRestore();
    });
  });

  // ─── Sorting ───────────────────────────────────────────────────────

  describe('sorting', () => {
    it('when sort="name:asc", calls qb.orderBy with entity.name, ASC', async () => {
      await service.execute(table, { page: 1, limit: 15, sort: 'name:asc' });

      expect(qb.orderBy).toHaveBeenCalledWith('entity.name', 'ASC');
    });

    it('uses defaultSort from config when no sort provided', async () => {
      await service.execute(table, { page: 1, limit: 15 });

      expect(qb.orderBy).toHaveBeenCalledWith('entity.createdAt', 'DESC');
    });

    it('ignores sort on non-sortable columns', async () => {
      // 'status' column is not sortable
      await service.execute(table, { page: 1, limit: 15, sort: 'status:asc' });

      // Should fall back to default sort
      expect(qb.orderBy).toHaveBeenCalledWith('entity.createdAt', 'DESC');
    });

    it('custom sortUsing callback is invoked when set', async () => {
      const customSortFn = jest.fn();

      @TableConfig({
        resource: FakeEntity,
        defaultSort: { column: 'id', direction: SortDirection.Asc },
      })
      class CustomSortTable extends BaseTable<FakeEntity> {
        columns() {
          return [
            TextColumn.make('name').sortable().sortUsing(customSortFn),
          ];
        }
      }

      const customTable = new CustomSortTable();
      const customQb = createMockQb([], 0);
      const customDs = createMockDataSource(customQb);
      const customService = new TableQueryService(customDs);

      await customService.execute(customTable, { page: 1, limit: 15, sort: 'name:desc' });

      expect(customSortFn).toHaveBeenCalledWith(customQb, 'desc');
    });
  });

  // ─── Pagination ────────────────────────────────────────────────────

  describe('pagination', () => {
    it('full pagination calls getCount(), then skip().take().getMany()', async () => {
      qb.getCount.mockResolvedValue(50);
      qb.getMany.mockResolvedValue([]);

      await service.execute(table, { page: 1, limit: 15 });

      expect(qb.getCount).toHaveBeenCalled();
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(15);
      expect(qb.getMany).toHaveBeenCalled();
    });

    it('calculates lastPage correctly (ceil(total/perPage))', async () => {
      qb.getCount.mockResolvedValue(31);
      qb.getMany.mockResolvedValue([]);

      const result = await service.execute(table, { page: 1, limit: 15 });

      expect(result.pagination.lastPage).toBe(3); // ceil(31/15) = 3
    });

    it('from/to calculated correctly', async () => {
      qb.getCount.mockResolvedValue(50);
      qb.getMany.mockResolvedValue(
        Array.from({ length: 15 }, (_, i) => ({ id: i + 16, name: `U${i}`, email: '', status: '' })),
      );

      const result = await service.execute(table, { page: 2, limit: 15 });

      expect(result.pagination.from).toBe(16);
      expect(result.pagination.to).toBe(30);
    });

    it('when total=0, from=0, to=0', async () => {
      qb.getCount.mockResolvedValue(0);
      qb.getMany.mockResolvedValue([]);

      const result = await service.execute(table, { page: 1, limit: 15 });

      expect(result.pagination.from).toBe(0);
      expect(result.pagination.to).toBe(0);
    });

    it('page=2 with limit=15 calls skip(15).take(15)', async () => {
      qb.getCount.mockResolvedValue(50);
      qb.getMany.mockResolvedValue([]);

      await service.execute(table, { page: 2, limit: 15 });

      expect(qb.skip).toHaveBeenCalledWith(15);
      expect(qb.take).toHaveBeenCalledWith(15);
    });

    it('cursor pagination: takes perPage+1, pops extra, sets nextCursor', async () => {
      @TableConfig({
        resource: FakeEntity,
        pagination: PaginationType.Cursor,
      })
      class CursorTable extends BaseTable<FakeEntity> {
        columns() {
          return [TextColumn.make('name')];
        }
      }

      const cursorTable = new CursorTable();
      // Return perPage+1 items to indicate there is a next page
      const items = Array.from({ length: 16 }, (_, i) => ({ id: i + 1, name: `User${i}` }));
      const cursorQb = createMockQb(items, 0);
      const cursorDs = createMockDataSource(cursorQb);
      const cursorService = new TableQueryService(cursorDs);

      const result = await cursorService.execute(cursorTable, { page: 1, limit: 15 });

      // Should have taken perPage + 1 = 16
      expect(cursorQb.take).toHaveBeenCalledWith(16);
      // Data should be capped at perPage (15), extra item popped
      expect(result.data).toHaveLength(15);
      // Should indicate there are more results
      expect(result.pagination.nextCursor).toBe('next');
      expect(result.pagination.type).toBe(PaginationType.Cursor);
    });
  });

  // ─── Transform ─────────────────────────────────────────────────────

  describe('transform', () => {
    it('each column mapForTable is called on the raw data', async () => {
      const mockData = [{ id: 1, name: 'Alice', email: 'a@b.com', status: 'active' }];
      qb.getMany.mockResolvedValue(mockData);
      qb.getCount.mockResolvedValue(1);

      const result = await service.execute(table, { page: 1, limit: 15 });

      expect(result.data[0].name).toBe('Alice');
      expect(result.data[0].email).toBe('a@b.com');
      // BadgeColumn mapForTable returns enriched object
      expect(result.data[0].status).toEqual({
        value: 'active',
        variant: 'success',
        icon: null,
      });
    });

    it('_actions are included with resolved URLs, disabled, hidden', async () => {
      const mockData = [{ id: 1, name: 'Alice', email: 'a@b.com', status: 'active' }];
      qb.getMany.mockResolvedValue(mockData);
      qb.getCount.mockResolvedValue(1);

      const result = await service.execute(table, { page: 1, limit: 15 });

      expect(result.data[0]).toHaveProperty('_actions');
      expect(result.data[0]._actions).toBeInstanceOf(Array);
      expect(result.data[0]._actions.length).toBeGreaterThan(0);
      const action = result.data[0]._actions[0];
      expect(action).toHaveProperty('url');
      expect(action).toHaveProperty('disabled');
      expect(action).toHaveProperty('hidden');
    });

    it('ActionColumn is skipped in data transformation', async () => {
      const mockData = [{ id: 1, name: 'Alice', email: 'a@b.com', status: 'active' }];
      qb.getMany.mockResolvedValue(mockData);
      qb.getCount.mockResolvedValue(1);

      const result = await service.execute(table, { page: 1, limit: 15 });

      // _actions should come from row actions, not from column mapping
      // The ActionColumn's mapForTable should NOT be called directly
      // Instead, _actions comes from getRowActions()
      const keys = Object.keys(result.data[0]);
      // Should have id, name, email, status, _actions
      expect(keys).toContain('id');
      expect(keys).toContain('name');
      expect(keys).toContain('email');
      expect(keys).toContain('status');
      expect(keys).toContain('_actions');
    });

    it('id is always included', async () => {
      const mockData = [{ id: 42, name: 'Bob', email: 'b@b.com', status: 'inactive' }];
      qb.getMany.mockResolvedValue(mockData);
      qb.getCount.mockResolvedValue(1);

      const result = await service.execute(table, { page: 1, limit: 15 });

      expect(result.data[0].id).toBe(42);
    });
  });

  // ─── Eager loading ─────────────────────────────────────────────────

  describe('eager loading', () => {
    it('nested columns trigger leftJoinAndSelect', async () => {
      @TableConfig({
        resource: FakeEntity,
      })
      class NestedTable extends BaseTable<FakeEntity> {
        columns() {
          return [
            TextColumn.make('department.name'),
          ];
        }
      }

      const nestedTable = new NestedTable();
      const nestedQb = createMockQb([], 0);
      const nestedDs = createMockDataSource(nestedQb);
      const nestedService = new TableQueryService(nestedDs);

      await nestedService.execute(nestedTable, { page: 1, limit: 15 });

      expect(nestedQb.leftJoinAndSelect).toHaveBeenCalledWith(
        'entity.department',
        'department',
      );
    });
  });
});
