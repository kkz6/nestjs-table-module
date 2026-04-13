import { Clause } from '../../enums';
import { NumericFilter } from '../numeric-filter';

describe('NumericFilter', () => {
  describe('defaultClauses()', () => {
    it('has correct 8 default clauses', () => {
      const filter = NumericFilter.make('price');
      expect(filter.getClauses()).toEqual([
        Clause.Equals,
        Clause.NotEquals,
        Clause.GreaterThan,
        Clause.GreaterThanOrEqual,
        Clause.LessThan,
        Clause.LessThanOrEqual,
        Clause.Between,
        Clause.NotBetween,
      ]);
    });
  });

  describe('validate()', () => {
    it('accepts numeric values', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate(42, Clause.Equals)).toBe(42);
    });

    it('accepts string numbers by casting', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate('42', Clause.Equals)).toBe(42);
    });

    it('accepts zero', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate(0, Clause.Equals)).toBe(0);
    });

    it('accepts negative numbers', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate(-5, Clause.Equals)).toBe(-5);
    });

    it('accepts float numbers', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate(3.14, Clause.Equals)).toBeCloseTo(3.14);
    });

    it('rejects NaN string', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate('not-a-number', Clause.Equals)).toBeNull();
    });

    it('coerces null to 0 (Number(null) === 0)', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate(null, Clause.Equals)).toBe(0);
    });

    it('rejects undefined (Number(undefined) is NaN)', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate(undefined, Clause.Equals)).toBeNull();
    });

    it('rejects objects', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate({}, Clause.Equals)).toBeNull();
    });

    it('rejects non-numeric strings', () => {
      const filter = NumericFilter.make('price');
      expect(filter.validate('abc', Clause.Equals)).toBeNull();
    });

    describe('Between/NotBetween clauses', () => {
      it('accepts array of 2 numbers for Between', () => {
        const filter = NumericFilter.make('price');
        expect(filter.validate([1, 10], Clause.Between)).toEqual([1, 10]);
      });

      it('accepts array of 2 numbers for NotBetween', () => {
        const filter = NumericFilter.make('price');
        expect(filter.validate([1, 10], Clause.NotBetween)).toEqual([1, 10]);
      });

      it('accepts array of string numbers for Between', () => {
        const filter = NumericFilter.make('price');
        expect(filter.validate(['1', '10'], Clause.Between)).toEqual([1, 10]);
      });

      it('rejects array with wrong length for Between', () => {
        const filter = NumericFilter.make('price');
        expect(filter.validate([1], Clause.Between)).toBeNull();
      });

      it('rejects array with 3 elements for Between', () => {
        const filter = NumericFilter.make('price');
        expect(filter.validate([1, 2, 3], Clause.Between)).toBeNull();
      });

      it('rejects array with NaN values for Between', () => {
        const filter = NumericFilter.make('price');
        expect(filter.validate(['a', 'b'], Clause.Between)).toBeNull();
      });

      it('rejects non-array for Between', () => {
        const filter = NumericFilter.make('price');
        expect(filter.validate(42, Clause.Between)).toBeNull();
      });

      it('rejects null for Between', () => {
        const filter = NumericFilter.make('price');
        expect(filter.validate(null, Clause.Between)).toBeNull();
      });
    });
  });

  describe('apply()', () => {
    let mockQb: { andWhere: jest.Mock };

    beforeEach(() => {
      mockQb = { andWhere: jest.fn() };
    });

    it('Equals uses = operator', () => {
      const filter = NumericFilter.make('price');
      filter.apply(mockQb, 'price', Clause.Equals, 42);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'price = :filter_price_equals',
        { filter_price_equals: 42 },
      );
    });

    it('NotEquals uses != operator', () => {
      const filter = NumericFilter.make('price');
      filter.apply(mockQb, 'price', Clause.NotEquals, 42);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'price != :filter_price_not_equals',
        { filter_price_not_equals: 42 },
      );
    });

    it('GreaterThan uses > operator', () => {
      const filter = NumericFilter.make('price');
      filter.apply(mockQb, 'price', Clause.GreaterThan, 42);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'price > :filter_price_greater_than',
        { filter_price_greater_than: 42 },
      );
    });

    it('GreaterThanOrEqual uses >= operator', () => {
      const filter = NumericFilter.make('price');
      filter.apply(mockQb, 'price', Clause.GreaterThanOrEqual, 42);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'price >= :filter_price_greater_than_or_equal',
        { filter_price_greater_than_or_equal: 42 },
      );
    });

    it('LessThan uses < operator', () => {
      const filter = NumericFilter.make('price');
      filter.apply(mockQb, 'price', Clause.LessThan, 42);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'price < :filter_price_less_than',
        { filter_price_less_than: 42 },
      );
    });

    it('LessThanOrEqual uses <= operator', () => {
      const filter = NumericFilter.make('price');
      filter.apply(mockQb, 'price', Clause.LessThanOrEqual, 42);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'price <= :filter_price_less_than_or_equal',
        { filter_price_less_than_or_equal: 42 },
      );
    });

    it('Between uses BETWEEN with min and max params', () => {
      const filter = NumericFilter.make('price');
      filter.apply(mockQb, 'price', Clause.Between, [10, 100]);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'price BETWEEN :filter_price_between_min AND :filter_price_between_max',
        { filter_price_between_min: 10, filter_price_between_max: 100 },
      );
    });

    it('NotBetween uses NOT BETWEEN with min and max params', () => {
      const filter = NumericFilter.make('price');
      filter.apply(mockQb, 'price', Clause.NotBetween, [10, 100]);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'price NOT BETWEEN :filter_price_not_between_min AND :filter_price_not_between_max',
        { filter_price_not_between_min: 10, filter_price_not_between_max: 100 },
      );
    });

    it('handles nested attributes with dot replacement in param name', () => {
      const filter = NumericFilter.make('order.total');
      filter.apply(mockQb, 'order.total', Clause.Equals, 99);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'order.total = :filter_order_total_equals',
        { filter_order_total_equals: 99 },
      );
    });
  });
});
