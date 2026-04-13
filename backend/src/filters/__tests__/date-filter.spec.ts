import { Clause } from '../../enums';
import { DateFilter } from '../date-filter';

describe('DateFilter', () => {
  describe('defaultClauses()', () => {
    it('has correct 8 default clauses', () => {
      const filter = DateFilter.make('created_at');
      expect(filter.getClauses()).toEqual([
        Clause.Before,
        Clause.After,
        Clause.EqualOrBefore,
        Clause.EqualOrAfter,
        Clause.Equals,
        Clause.NotEquals,
        Clause.Between,
        Clause.NotBetween,
      ]);
    });
  });

  describe('validate()', () => {
    it('accepts valid date string "2025-03-15"', () => {
      const filter = DateFilter.make('created_at');
      expect(filter.validate('2025-03-15', Clause.Equals)).toBe('2025-03-15');
    });

    it('accepts ISO date string and returns YYYY-MM-DD', () => {
      const filter = DateFilter.make('created_at');
      const result = filter.validate('2025-03-15T10:00:00Z', Clause.Equals);
      expect(result).toBe('2025-03-15');
    });

    it('accepts numeric timestamps', () => {
      const filter = DateFilter.make('created_at');
      // 2025-01-01T00:00:00Z in milliseconds
      const timestamp = new Date('2025-01-01T00:00:00Z').getTime();
      const result = filter.validate(timestamp, Clause.Equals);
      expect(result).toBe('2025-01-01');
    });

    it('rejects invalid date strings', () => {
      const filter = DateFilter.make('created_at');
      expect(filter.validate('not-a-date', Clause.Equals)).toBeNull();
    });

    it('rejects null', () => {
      const filter = DateFilter.make('created_at');
      expect(filter.validate(null, Clause.Equals)).toBeNull();
    });

    it('rejects undefined', () => {
      const filter = DateFilter.make('created_at');
      expect(filter.validate(undefined, Clause.Equals)).toBeNull();
    });

    it('rejects objects', () => {
      const filter = DateFilter.make('created_at');
      expect(filter.validate({}, Clause.Equals)).toBeNull();
    });

    it('rejects arrays (non-Between clause)', () => {
      const filter = DateFilter.make('created_at');
      expect(filter.validate([], Clause.Equals)).toBeNull();
    });

    it('rejects boolean values', () => {
      const filter = DateFilter.make('created_at');
      expect(filter.validate(true, Clause.Equals)).toBeNull();
    });

    describe('Between/NotBetween clauses', () => {
      it('accepts array of 2 valid date strings for Between', () => {
        const filter = DateFilter.make('created_at');
        const result = filter.validate(['2025-01-01', '2025-12-31'], Clause.Between);
        expect(result).toEqual(['2025-01-01', '2025-12-31']);
      });

      it('accepts array of 2 valid date strings for NotBetween', () => {
        const filter = DateFilter.make('created_at');
        const result = filter.validate(['2025-01-01', '2025-12-31'], Clause.NotBetween);
        expect(result).toEqual(['2025-01-01', '2025-12-31']);
      });

      it('accepts ISO date strings in arrays', () => {
        const filter = DateFilter.make('created_at');
        const result = filter.validate(
          ['2025-01-01T00:00:00Z', '2025-06-15T00:00:00Z'],
          Clause.Between,
        );
        expect(result).toEqual(['2025-01-01', '2025-06-15']);
      });

      it('rejects array with wrong length', () => {
        const filter = DateFilter.make('created_at');
        expect(filter.validate(['2025-01-01'], Clause.Between)).toBeNull();
      });

      it('rejects array with 3 elements', () => {
        const filter = DateFilter.make('created_at');
        expect(
          filter.validate(['2025-01-01', '2025-06-15', '2025-12-31'], Clause.Between),
        ).toBeNull();
      });

      it('rejects array with invalid dates', () => {
        const filter = DateFilter.make('created_at');
        expect(filter.validate(['not-a-date', '2025-12-31'], Clause.Between)).toBeNull();
      });

      it('rejects array where second date is invalid', () => {
        const filter = DateFilter.make('created_at');
        expect(filter.validate(['2025-01-01', 'bad'], Clause.Between)).toBeNull();
      });

      it('rejects non-array for Between', () => {
        const filter = DateFilter.make('created_at');
        expect(filter.validate('2025-01-01', Clause.Between)).toBeNull();
      });

      it('rejects null for Between', () => {
        const filter = DateFilter.make('created_at');
        expect(filter.validate(null, Clause.Between)).toBeNull();
      });
    });
  });

  describe('apply()', () => {
    let mockQb: { andWhere: jest.Mock };

    beforeEach(() => {
      mockQb = { andWhere: jest.fn() };
    });

    it('Before uses < operator', () => {
      const filter = DateFilter.make('created_at');
      filter.apply(mockQb, 'created_at', Clause.Before, '2025-03-15');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'created_at < :filter_created_at_before',
        { filter_created_at_before: '2025-03-15' },
      );
    });

    it('After uses > operator', () => {
      const filter = DateFilter.make('created_at');
      filter.apply(mockQb, 'created_at', Clause.After, '2025-03-15');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'created_at > :filter_created_at_after',
        { filter_created_at_after: '2025-03-15' },
      );
    });

    it('EqualOrBefore uses <= operator', () => {
      const filter = DateFilter.make('created_at');
      filter.apply(mockQb, 'created_at', Clause.EqualOrBefore, '2025-03-15');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'created_at <= :filter_created_at_equal_or_before',
        { filter_created_at_equal_or_before: '2025-03-15' },
      );
    });

    it('EqualOrAfter uses >= operator', () => {
      const filter = DateFilter.make('created_at');
      filter.apply(mockQb, 'created_at', Clause.EqualOrAfter, '2025-03-15');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'created_at >= :filter_created_at_equal_or_after',
        { filter_created_at_equal_or_after: '2025-03-15' },
      );
    });

    it('Equals uses DATE() wrapper with = operator', () => {
      const filter = DateFilter.make('created_at');
      filter.apply(mockQb, 'created_at', Clause.Equals, '2025-03-15');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'DATE(created_at) = :filter_created_at_equals',
        { filter_created_at_equals: '2025-03-15' },
      );
    });

    it('NotEquals uses DATE() wrapper with != operator', () => {
      const filter = DateFilter.make('created_at');
      filter.apply(mockQb, 'created_at', Clause.NotEquals, '2025-03-15');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'DATE(created_at) != :filter_created_at_not_equals',
        { filter_created_at_not_equals: '2025-03-15' },
      );
    });

    it('Between uses BETWEEN with min and max params', () => {
      const filter = DateFilter.make('created_at');
      filter.apply(mockQb, 'created_at', Clause.Between, ['2025-01-01', '2025-12-31']);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'created_at BETWEEN :filter_created_at_between_min AND :filter_created_at_between_max',
        {
          filter_created_at_between_min: '2025-01-01',
          filter_created_at_between_max: '2025-12-31',
        },
      );
    });

    it('NotBetween uses NOT BETWEEN with min and max params', () => {
      const filter = DateFilter.make('created_at');
      filter.apply(mockQb, 'created_at', Clause.NotBetween, ['2025-01-01', '2025-12-31']);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'created_at NOT BETWEEN :filter_created_at_not_between_min AND :filter_created_at_not_between_max',
        {
          filter_created_at_not_between_min: '2025-01-01',
          filter_created_at_not_between_max: '2025-12-31',
        },
      );
    });

    it('handles nested attributes with dot replacement in param name', () => {
      const filter = DateFilter.make('order.createdAt');
      filter.apply(mockQb, 'order.createdAt', Clause.Before, '2025-03-15');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'order.createdAt < :filter_order_createdAt_before',
        { filter_order_createdAt_before: '2025-03-15' },
      );
    });
  });
});
