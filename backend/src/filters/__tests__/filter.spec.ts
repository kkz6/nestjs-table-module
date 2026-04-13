import { Clause } from '../../enums';
import { TextFilter } from '../text-filter';
import { NumericFilter } from '../numeric-filter';

describe('Filter (base class)', () => {
  describe('make()', () => {
    it('creates with correct attribute', () => {
      const filter = TextFilter.make('name');
      expect(filter.getAttribute()).toBe('name');
    });

    it('auto-generates label from attribute', () => {
      const filter = TextFilter.make('first_name');
      expect(filter.getLabel()).toBe('First name');
    });

    it('auto-generates label from camelCase attribute', () => {
      const filter = TextFilter.make('firstName');
      expect(filter.getLabel()).toBe('First name');
    });

    it('auto-generates label from nested attribute', () => {
      const filter = TextFilter.make('department.name');
      expect(filter.getLabel()).toBe('Name');
    });

    it('uses explicit label when provided', () => {
      const filter = TextFilter.make('name', 'Full Name');
      expect(filter.getLabel()).toBe('Full Name');
    });
  });

  describe('clauses', () => {
    it('returns default clauses when none set', () => {
      const filter = TextFilter.make('name');
      expect(filter.getClauses()).toEqual(TextFilter.make('name').defaultClauses());
    });

    it('custom clauses override defaults', () => {
      const filter = TextFilter.make('name').clauses([Clause.Equals, Clause.NotEquals]);
      expect(filter.getClauses()).toEqual([Clause.Equals, Clause.NotEquals]);
    });

    it('nullable() adds IsSet and IsNotSet', () => {
      const filter = NumericFilter.make('age').nullable();
      const clauses = filter.getClauses();
      expect(clauses).toContain(Clause.IsSet);
      expect(clauses).toContain(Clause.IsNotSet);
    });

    it('nullable() does not duplicate IsSet/IsNotSet', () => {
      const filter = NumericFilter.make('age').nullable().nullable();
      const clauses = filter.getClauses();
      const isSetCount = clauses.filter((c: Clause) => c === Clause.IsSet).length;
      expect(isSetCount).toBe(1);
    });
  });

  describe('nested relations', () => {
    it('detects nested attributes', () => {
      const filter = TextFilter.make('department.name');
      expect(filter.isNested()).toBe(true);
    });

    it('non-nested attributes return false', () => {
      const filter = TextFilter.make('name');
      expect(filter.isNested()).toBe(false);
    });

    it('pivot attributes are not nested', () => {
      const filter = TextFilter.make('pivot.quantity');
      expect(filter.isNested()).toBe(false);
    });

    it('getRelationshipName returns relationship path', () => {
      const filter = TextFilter.make('department.name');
      expect(filter.getRelationshipName()).toBe('department');
    });

    it('getRelationshipColumn returns column name', () => {
      const filter = TextFilter.make('department.name');
      expect(filter.getRelationshipColumn()).toBe('name');
    });
  });

  describe('default values', () => {
    it('hasDefaultValue returns false by default', () => {
      const filter = TextFilter.make('name');
      expect(filter.hasDefaultValue()).toBe(false);
    });

    it('default() sets default value', () => {
      const filter = TextFilter.make('name').default('test');
      expect(filter.hasDefaultValue()).toBe(true);
      expect(filter.getDefaultValue()).toBe('test');
    });

    it('default() sets default clause', () => {
      const filter = TextFilter.make('name').default('test', Clause.Equals);
      expect(filter.getDefaultClause()).toBe(Clause.Equals);
    });

    it('getDefaultClause falls back to first clause', () => {
      const filter = TextFilter.make('name');
      expect(filter.getDefaultClause()).toBe(Clause.Contains);
    });
  });

  describe('hidden', () => {
    it('is not hidden by default', () => {
      const filter = TextFilter.make('name');
      expect(filter.isHidden()).toBe(false);
    });

    it('hidden() sets hidden flag', () => {
      const filter = TextFilter.make('name').hidden();
      expect(filter.isHidden()).toBe(true);
    });

    it('hidden(false) unsets hidden flag', () => {
      const filter = TextFilter.make('name').hidden().hidden(false);
      expect(filter.isHidden()).toBe(false);
    });
  });

  describe('handle()', () => {
    it('handles IsSet clause', () => {
      const mockQb = { andWhere: jest.fn() };
      const filter = TextFilter.make('name');
      filter.handle(mockQb, Clause.IsSet, null);
      expect(mockQb.andWhere).toHaveBeenCalledWith('name IS NOT NULL');
    });

    it('handles IsNotSet clause', () => {
      const mockQb = { andWhere: jest.fn() };
      const filter = TextFilter.make('name');
      filter.handle(mockQb, Clause.IsNotSet, null);
      expect(mockQb.andWhere).toHaveBeenCalledWith('name IS NULL');
    });

    it('uses applyUsing when set', () => {
      const mockQb = { andWhere: jest.fn() };
      const customApply = jest.fn();
      const filter = TextFilter.make('name').applyUsing(customApply);
      filter.handle(mockQb, Clause.Equals, 'test');
      expect(customApply).toHaveBeenCalledWith(mockQb, 'name', Clause.Equals, 'test');
      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('toArray()', () => {
    it('serializes correctly', () => {
      const filter = TextFilter.make('name', 'Name');
      const serialized = filter.toArray();

      expect(serialized).toEqual({
        key: 'name',
        label: 'Name',
        type: 'text',
        clauses: filter.getClauses(),
        default: null,
      });
    });

    it('serializes with default value', () => {
      const filter = TextFilter.make('name').default('test', Clause.Equals);
      const serialized = filter.toArray();

      expect(serialized.default).toEqual({
        value: 'test',
        clause: Clause.Equals,
      });
    });

    it('serializes with hidden flag', () => {
      const filter = TextFilter.make('name').hidden();
      const serialized = filter.toArray();
      expect(serialized.hidden).toBe(true);
    });

    it('does not include hidden when false', () => {
      const filter = TextFilter.make('name');
      const serialized = filter.toArray();
      expect(serialized.hidden).toBeUndefined();
    });
  });
});
