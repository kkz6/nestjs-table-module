import { Clause } from '../../enums';
import { SetFilter } from '../set-filter';

describe('SetFilter', () => {
  describe('options', () => {
    it('accepts array of FilterOption objects', () => {
      const filter = SetFilter.make('status').options([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]);
      expect(filter.getOptions()).toEqual([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]);
    });

    it('converts Record<string, string> to FilterOption array', () => {
      const filter = SetFilter.make('status').options({
        active: 'Active',
        inactive: 'Inactive',
      });
      expect(filter.getOptions()).toEqual([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]);
    });
  });

  describe('multiple', () => {
    it('is multiple by default', () => {
      const filter = SetFilter.make('status');
      expect(filter.isMultiple()).toBe(true);
    });

    it('can be set to single', () => {
      const filter = SetFilter.make('status').multiple(false);
      expect(filter.isMultiple()).toBe(false);
    });
  });

  describe('withoutClause()', () => {
    it('sets clauses to Equals only', () => {
      const filter = SetFilter.make('status').withoutClause();
      expect(filter.getClauses()).toEqual([Clause.Equals]);
    });
  });

  describe('defaultClauses()', () => {
    it('has correct default clauses', () => {
      const filter = SetFilter.make('status');
      expect(filter.getClauses()).toEqual([
        Clause.In,
        Clause.NotIn,
        Clause.Equals,
        Clause.NotEquals,
      ]);
    });
  });

  describe('validate()', () => {
    it('validates array for In clause', () => {
      const filter = SetFilter.make('status');
      expect(filter.validate(['active', 'inactive'], Clause.In)).toEqual([
        'active',
        'inactive',
      ]);
    });

    it('rejects non-array for In clause', () => {
      const filter = SetFilter.make('status');
      expect(filter.validate('active', Clause.In)).toBeNull();
    });

    it('filters non-string values from array', () => {
      const filter = SetFilter.make('status');
      expect(filter.validate(['active', 123, null], Clause.In)).toEqual(['active']);
    });

    it('returns null for empty array after filtering', () => {
      const filter = SetFilter.make('status');
      expect(filter.validate([123, null], Clause.In)).toBeNull();
    });

    it('validates string for Equals clause', () => {
      const filter = SetFilter.make('status');
      expect(filter.validate('active', Clause.Equals)).toBe('active');
    });

    it('rejects non-string for Equals clause', () => {
      const filter = SetFilter.make('status');
      expect(filter.validate(123, Clause.Equals)).toBeNull();
    });
  });

  describe('apply()', () => {
    let mockQb: { andWhere: jest.Mock };

    beforeEach(() => {
      mockQb = { andWhere: jest.fn() };
    });

    it('In uses IN (:...param)', () => {
      const filter = SetFilter.make('status');
      filter.apply(mockQb, 'status', Clause.In, ['active', 'inactive']);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'status IN (:...filter_status_in)',
        { filter_status_in: ['active', 'inactive'] },
      );
    });

    it('NotIn uses NOT IN (:...param)', () => {
      const filter = SetFilter.make('status');
      filter.apply(mockQb, 'status', Clause.NotIn, ['active']);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'status NOT IN (:...filter_status_not_in)',
        { filter_status_not_in: ['active'] },
      );
    });
  });

  describe('toArray()', () => {
    it('includes options and multiple in serialization', () => {
      const filter = SetFilter.make('status', 'Status').options([
        { value: 'active', label: 'Active' },
      ]);
      const serialized = filter.toArray();

      expect(serialized.options).toEqual([{ value: 'active', label: 'Active' }]);
      expect(serialized.multiple).toBe(true);
    });

    it('includes multiple=false when set', () => {
      const filter = SetFilter.make('status').multiple(false);
      const serialized = filter.toArray();
      expect(serialized.multiple).toBe(false);
    });
  });
});
