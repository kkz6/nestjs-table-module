import 'reflect-metadata';
import { TableRegistry } from '../table-registry';
import { BaseTable } from '../base-table';
import { TableConfig } from '../decorators/table-config.decorator';
import { Column } from '../columns/column';

class FakeEntity {}

@TableConfig({
  resource: FakeEntity,
})
class UsersTable extends BaseTable<any> {
  columns(): Column[] {
    return [];
  }
}

@TableConfig({
  resource: FakeEntity,
})
class OrdersTable extends BaseTable<any> {
  columns(): Column[] {
    return [];
  }
}

describe('TableRegistry', () => {
  let registry: TableRegistry;

  beforeEach(() => {
    registry = new TableRegistry();
  });

  describe('register and get', () => {
    it('registers a table and retrieves it by name', () => {
      const table = new UsersTable();
      registry.register('users', table);

      const retrieved = registry.get('users');
      expect(retrieved).toBe(table);
    });

    it('sets the registry name on the table', () => {
      const table = new UsersTable();
      registry.register('users', table);

      expect(table.getRegistryName()).toBe('users');
    });

    it('returns undefined for unregistered tables', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
    });
  });

  describe('has()', () => {
    it('returns true for registered tables', () => {
      const table = new UsersTable();
      registry.register('users', table);

      expect(registry.has('users')).toBe(true);
    });

    it('returns false for unregistered tables', () => {
      expect(registry.has('users')).toBe(false);
    });
  });

  describe('getAll()', () => {
    it('returns a map of all registered tables', () => {
      const usersTable = new UsersTable();
      const ordersTable = new OrdersTable();

      registry.register('users', usersTable);
      registry.register('orders', ordersTable);

      const all = registry.getAll();
      expect(all).toBeInstanceOf(Map);
      expect(all.size).toBe(2);
      expect(all.get('users')).toBe(usersTable);
      expect(all.get('orders')).toBe(ordersTable);
    });

    it('returns empty map when no tables registered', () => {
      const all = registry.getAll();
      expect(all).toBeInstanceOf(Map);
      expect(all.size).toBe(0);
    });
  });
});
