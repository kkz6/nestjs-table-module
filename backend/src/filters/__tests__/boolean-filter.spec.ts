import { Clause } from '../../enums';
import { BooleanFilter } from '../boolean-filter';

describe('BooleanFilter', () => {
  describe('defaultClauses()', () => {
    it('has IsTrue and IsFalse as default clauses', () => {
      const filter = BooleanFilter.make('is_active');
      expect(filter.getClauses()).toEqual([Clause.IsTrue, Clause.IsFalse]);
    });
  });

  describe('validate()', () => {
    it('always returns null (no value needed)', () => {
      const filter = BooleanFilter.make('is_active');
      expect(filter.validate('anything', Clause.IsTrue)).toBeNull();
      expect(filter.validate(null, Clause.IsFalse)).toBeNull();
    });
  });

  describe('default()', () => {
    it('auto-sets clause to IsTrue for true value', () => {
      const filter = BooleanFilter.make('is_active').default(true);
      expect(filter.getDefaultClause()).toBe(Clause.IsTrue);
      expect(filter.getDefaultValue()).toBe(true);
    });

    it('auto-sets clause to IsFalse for false value', () => {
      const filter = BooleanFilter.make('is_active').default(false);
      expect(filter.getDefaultClause()).toBe(Clause.IsFalse);
      expect(filter.getDefaultValue()).toBe(false);
    });

    it('explicit clause overrides auto-set', () => {
      const filter = BooleanFilter.make('is_active').default(true, Clause.IsFalse);
      expect(filter.getDefaultClause()).toBe(Clause.IsFalse);
      expect(filter.getDefaultValue()).toBe(true);
    });
  });

  describe('apply()', () => {
    let mockQb: { andWhere: jest.Mock };

    beforeEach(() => {
      mockQb = { andWhere: jest.fn() };
    });

    it('IsTrue applies = true', () => {
      const filter = BooleanFilter.make('is_active');
      filter.apply(mockQb, 'is_active', Clause.IsTrue, null);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'is_active = :filter_is_active_is_true',
        { filter_is_active_is_true: true },
      );
    });

    it('IsFalse applies = false', () => {
      const filter = BooleanFilter.make('is_active');
      filter.apply(mockQb, 'is_active', Clause.IsFalse, null);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'is_active = :filter_is_active_is_false',
        { filter_is_active_is_false: false },
      );
    });
  });
});
