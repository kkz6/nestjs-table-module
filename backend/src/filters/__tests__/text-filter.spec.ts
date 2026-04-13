import { Clause } from '../../enums';
import { TextFilter } from '../text-filter';

describe('TextFilter', () => {
  describe('defaultClauses()', () => {
    it('has correct default clauses', () => {
      const filter = TextFilter.make('name');
      expect(filter.getClauses()).toEqual([
        Clause.Contains,
        Clause.NotContains,
        Clause.StartsWith,
        Clause.EndsWith,
        Clause.NotStartsWith,
        Clause.NotEndsWith,
        Clause.Equals,
        Clause.NotEquals,
      ]);
    });
  });

  describe('validate()', () => {
    it('validates string values', () => {
      const filter = TextFilter.make('name');
      expect(filter.validate('hello', Clause.Contains)).toBe('hello');
    });

    it('validates number values by casting to string', () => {
      const filter = TextFilter.make('name');
      expect(filter.validate(42, Clause.Contains)).toBe('42');
    });

    it('rejects null values', () => {
      const filter = TextFilter.make('name');
      expect(filter.validate(null, Clause.Contains)).toBeNull();
    });

    it('rejects undefined values', () => {
      const filter = TextFilter.make('name');
      expect(filter.validate(undefined, Clause.Contains)).toBeNull();
    });

    it('rejects object values', () => {
      const filter = TextFilter.make('name');
      expect(filter.validate({}, Clause.Contains)).toBeNull();
    });

    it('rejects array values', () => {
      const filter = TextFilter.make('name');
      expect(filter.validate([], Clause.Contains)).toBeNull();
    });

    it('rejects boolean values', () => {
      const filter = TextFilter.make('name');
      expect(filter.validate(true, Clause.Contains)).toBeNull();
    });
  });

  describe('apply()', () => {
    let mockQb: { andWhere: jest.Mock };

    beforeEach(() => {
      mockQb = { andWhere: jest.fn() };
    });

    it('Contains uses ILIKE with %value%', () => {
      const filter = TextFilter.make('name');
      filter.apply(mockQb, 'name', Clause.Contains, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'name ILIKE :filter_name_contains',
        { filter_name_contains: '%test%' },
      );
    });

    it('NotContains uses NOT ILIKE with %value%', () => {
      const filter = TextFilter.make('name');
      filter.apply(mockQb, 'name', Clause.NotContains, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'name NOT ILIKE :filter_name_not_contains',
        { filter_name_not_contains: '%test%' },
      );
    });

    it('StartsWith uses ILIKE with value%', () => {
      const filter = TextFilter.make('name');
      filter.apply(mockQb, 'name', Clause.StartsWith, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'name ILIKE :filter_name_starts_with',
        { filter_name_starts_with: 'test%' },
      );
    });

    it('EndsWith uses ILIKE with %value', () => {
      const filter = TextFilter.make('name');
      filter.apply(mockQb, 'name', Clause.EndsWith, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'name ILIKE :filter_name_ends_with',
        { filter_name_ends_with: '%test' },
      );
    });

    it('NotStartsWith uses NOT ILIKE with value%', () => {
      const filter = TextFilter.make('name');
      filter.apply(mockQb, 'name', Clause.NotStartsWith, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'name NOT ILIKE :filter_name_not_starts_with',
        { filter_name_not_starts_with: 'test%' },
      );
    });

    it('NotEndsWith uses NOT ILIKE with %value', () => {
      const filter = TextFilter.make('name');
      filter.apply(mockQb, 'name', Clause.NotEndsWith, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'name NOT ILIKE :filter_name_not_ends_with',
        { filter_name_not_ends_with: '%test' },
      );
    });

    it('Equals uses = operator', () => {
      const filter = TextFilter.make('name');
      filter.apply(mockQb, 'name', Clause.Equals, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'name = :filter_name_equals',
        { filter_name_equals: 'test' },
      );
    });

    it('NotEquals uses != operator', () => {
      const filter = TextFilter.make('name');
      filter.apply(mockQb, 'name', Clause.NotEquals, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'name != :filter_name_not_equals',
        { filter_name_not_equals: 'test' },
      );
    });

    it('handles nested attributes with dot replacement in param name', () => {
      const filter = TextFilter.make('department.name');
      filter.apply(mockQb, 'department.name', Clause.Contains, 'test');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'department.name ILIKE :filter_department_name_contains',
        { filter_department_name_contains: '%test%' },
      );
    });
  });
});
