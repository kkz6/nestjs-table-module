import { Column } from '../column';
import { ColumnAlignment } from '../../enums';

class TestColumn extends Column {
  readonly type = 'test';
}

describe('Column (base class)', () => {
  describe('make() factory', () => {
    it('creates an instance with correct attribute and header', () => {
      const col = TestColumn.make('name', 'Full Name');
      expect(col.getAttribute()).toBe('name');
      expect(col.getHeader()).toBe('Full Name');
    });

    it('auto-generates header from snake_case attribute', () => {
      const col = TestColumn.make('created_at');
      expect(col.getHeader()).toBe('Created at');
    });

    it('auto-generates header from camelCase attribute', () => {
      const col = TestColumn.make('firstName');
      expect(col.getHeader()).toBe('First name');
    });

    it('auto-generates header from nested attribute (uses last segment)', () => {
      const col = TestColumn.make('department.name');
      expect(col.getHeader()).toBe('Name');
    });

    it('auto-generates header from deeply nested attribute', () => {
      const col = TestColumn.make('user.department.display_name');
      expect(col.getHeader()).toBe('Display name');
    });
  });

  describe('chainable builder methods', () => {
    it('sortable() returns this and sets sortable', () => {
      const col = TestColumn.make('name');
      const result = col.sortable();
      expect(result).toBe(col);
      expect(col.isSortable()).toBe(true);
    });

    it('notSortable() sets sortable to false', () => {
      const col = TestColumn.make('name').sortable().notSortable();
      expect(col.isSortable()).toBe(false);
    });

    it('searchable() returns this and sets searchable', () => {
      const col = TestColumn.make('name');
      const result = col.searchable();
      expect(result).toBe(col);
      expect(col.isSearchable()).toBe(true);
    });

    it('notSearchable() sets searchable to false', () => {
      const col = TestColumn.make('name').searchable().notSearchable();
      expect(col.isSearchable()).toBe(false);
    });

    it('toggleable() returns this and sets toggleable', () => {
      const col = TestColumn.make('name').notToggleable();
      const result = col.toggleable();
      expect(result).toBe(col);
      expect(col.isToggleable()).toBe(true);
    });

    it('notToggleable() sets toggleable to false', () => {
      const col = TestColumn.make('name').notToggleable();
      expect(col.isToggleable()).toBe(false);
    });

    it('visible() and hidden() work correctly', () => {
      const col = TestColumn.make('name').hidden();
      expect(col.isVisible()).toBe(false);

      // When toggleable is false, isVisible always returns true
      col.notToggleable();
      expect(col.isVisible()).toBe(true);

      // Re-enable toggleable and set hidden
      col.toggleable().hidden();
      expect(col.isVisible()).toBe(false);

      col.visible();
      expect(col.isVisible()).toBe(true);
    });

    it('align() and alignment shortcuts work', () => {
      const col = TestColumn.make('name');

      col.centerAligned();
      expect(col.toArray().alignment).toBe(ColumnAlignment.Center);

      col.rightAligned();
      expect(col.toArray().alignment).toBe(ColumnAlignment.Right);

      col.leftAligned();
      expect(col.toArray().alignment).toBe(ColumnAlignment.Left);

      const result = col.align(ColumnAlignment.Center);
      expect(result).toBe(col);
    });

    it('wrap() returns this and sets wrap', () => {
      const col = TestColumn.make('name');
      const result = col.wrap();
      expect(result).toBe(col);
      expect(col.toArray().wrap).toBe(true);
    });

    it('truncate() sets truncate and enables wrap', () => {
      const col = TestColumn.make('name');
      const result = col.truncate(2);
      expect(result).toBe(col);
      expect(col.toArray().truncate).toBe(2);
      expect(col.toArray().wrap).toBe(true);
    });

    it('headerClass() returns this and sets headerClass', () => {
      const col = TestColumn.make('name');
      const result = col.headerClass('text-bold');
      expect(result).toBe(col);
      expect(col.toArray().headerClass).toBe('text-bold');
    });

    it('cellClass() returns this and sets cellClass', () => {
      const col = TestColumn.make('name');
      const result = col.cellClass('text-red');
      expect(result).toBe(col);
      expect(col.toArray().cellClass).toBe('text-red');
    });

    it('stickable() returns this and sets stickable', () => {
      const col = TestColumn.make('name');
      const result = col.stickable();
      expect(result).toBe(col);
      expect(col.isStickable()).toBe(true);
    });

    it('notStickable() sets stickable to false', () => {
      const col = TestColumn.make('name').stickable().notStickable();
      expect(col.isStickable()).toBe(false);
    });

    it('meta() returns this and sets meta', () => {
      const col = TestColumn.make('name');
      const result = col.meta({ foo: 'bar' });
      expect(result).toBe(col);
      expect(col.toArray().meta).toEqual({ foo: 'bar' });
    });

    it('dontExport() sets shouldExport to false', () => {
      const col = TestColumn.make('name').dontExport();
      expect(col.shouldBeExported()).toBe(false);
    });

    it('sortUsing() sets a custom sort function', () => {
      const fn = jest.fn();
      const col = TestColumn.make('name').sortUsing(fn);
      expect(col.getSortUsing()).toBe(fn);
    });
  });

  describe('toArray() serialization', () => {
    it('serializes correctly with defaults', () => {
      const col = TestColumn.make('email', 'Email');
      const arr = col.toArray();

      expect(arr).toEqual({
        type: 'test',
        key: 'email',
        header: 'Email',
        sortable: false,
        searchable: false,
        toggleable: true,
        visible: true,
        alignment: ColumnAlignment.Left,
        wrap: false,
        truncate: false,
        headerClass: null,
        cellClass: null,
        stickable: false,
        meta: null,
      });
    });

    it('serializes with customized values', () => {
      const col = TestColumn.make('name', 'Name')
        .sortable()
        .searchable()
        .centerAligned()
        .wrap()
        .stickable()
        .meta({ custom: true });

      const arr = col.toArray();
      expect(arr.sortable).toBe(true);
      expect(arr.searchable).toBe(true);
      expect(arr.alignment).toBe(ColumnAlignment.Center);
      expect(arr.wrap).toBe(true);
      expect(arr.stickable).toBe(true);
      expect(arr.meta).toEqual({ custom: true });
    });
  });

  describe('mapAs()', () => {
    it('transforms values with a function', () => {
      const col = TestColumn.make('status').mapAs((val) => val.toUpperCase());
      expect(col.mapForTable('active')).toBe('ACTIVE');
    });

    it('transforms values with a map object', () => {
      const col = TestColumn.make('status').mapAs({
        active: 'Active',
        inactive: 'Inactive',
      });
      expect(col.mapForTable('active')).toBe('Active');
      expect(col.mapForTable('inactive')).toBe('Inactive');
      expect(col.mapForTable('unknown')).toBeNull();
    });

    it('returns null for null value with map', () => {
      const col = TestColumn.make('status').mapAs({ active: 'Active' });
      expect(col.mapForTable(null)).toBeNull();
    });
  });

  describe('nested relation detection', () => {
    it('isNested() returns true for dotted attributes', () => {
      const col = TestColumn.make('department.name');
      expect(col.isNested()).toBe(true);
    });

    it('isNested() returns false for plain attributes', () => {
      const col = TestColumn.make('name');
      expect(col.isNested()).toBe(false);
    });

    it('isNested() returns false for pivot attributes', () => {
      const col = TestColumn.make('pivot.value');
      expect(col.isNested()).toBe(false);
    });

    it('getRelationshipName() returns everything before the last dot', () => {
      const col = TestColumn.make('user.department.name');
      expect(col.getRelationshipName()).toBe('user.department');
    });

    it('getRelationshipColumn() returns the last segment', () => {
      const col = TestColumn.make('user.department.name');
      expect(col.getRelationshipColumn()).toBe('name');
    });
  });

  describe('getDataFromItem()', () => {
    it('gets a simple property', () => {
      const col = TestColumn.make('name');
      expect(col.getDataFromItem({ name: 'John' })).toBe('John');
    });

    it('traverses nested objects', () => {
      const col = TestColumn.make('department.name');
      const item = { department: { name: 'Engineering' } };
      expect(col.getDataFromItem(item)).toBe('Engineering');
    });

    it('traverses deeply nested objects', () => {
      const col = TestColumn.make('user.department.name');
      const item = { user: { department: { name: 'Engineering' } } };
      expect(col.getDataFromItem(item)).toBe('Engineering');
    });

    it('returns null for missing nested properties', () => {
      const col = TestColumn.make('department.name');
      expect(col.getDataFromItem({ department: null })).toBeNull();
    });

    it('returns null for completely missing paths', () => {
      const col = TestColumn.make('department.name');
      expect(col.getDataFromItem({})).toBeNull();
    });
  });

  describe('mapForExport()', () => {
    it('uses exportAs function when set', () => {
      const col = TestColumn.make('name')
        .exportAs((val) => `Export: ${val}`);
      expect(col.mapForExport('John')).toBe('Export: John');
    });

    it('falls back to mapForTable when exportAs is not set', () => {
      const col = TestColumn.make('status').mapAs((val) => val.toUpperCase());
      expect(col.mapForExport('active')).toBe('ACTIVE');
    });
  });
});
