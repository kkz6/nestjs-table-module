import { Clause } from '../../enums';
import { TrashedFilter } from '../trashed-filter';

describe('TrashedFilter', () => {
  describe('make()', () => {
    it('creates with default attribute "trashed" and label "Trashed"', () => {
      const filter = TrashedFilter.make();
      expect(filter.getAttribute()).toBe('trashed');
      expect(filter.getLabel()).toBe('Trashed');
    });

    it('creates with custom attribute and label', () => {
      const filter = TrashedFilter.make('deleted', 'Deleted Items');
      expect(filter.getAttribute()).toBe('deleted');
      expect(filter.getLabel()).toBe('Deleted Items');
    });

    it('has 3 options', () => {
      const filter = TrashedFilter.make();
      const options = filter.getOptions();
      expect(options).toHaveLength(3);
      expect(options).toEqual([
        { value: 'without_trashed', label: 'Without trashed' },
        { value: 'with_trashed', label: 'With trashed' },
        { value: 'only_trashed', label: 'Only trashed' },
      ]);
    });

    it('has only Equals clause (withoutClause)', () => {
      const filter = TrashedFilter.make();
      expect(filter.getClauses()).toEqual([Clause.Equals]);
    });
  });

  describe('handle()', () => {
    let mockQb: { andWhere: jest.Mock; withDeleted: jest.Mock };

    beforeEach(() => {
      mockQb = { andWhere: jest.fn(), withDeleted: jest.fn() };
    });

    it('with "with_trashed" calls qb.withDeleted()', () => {
      const filter = TrashedFilter.make();
      filter.handle(mockQb, Clause.Equals, 'with_trashed');
      expect(mockQb.withDeleted).toHaveBeenCalledTimes(1);
      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });

    it('with "only_trashed" calls qb.withDeleted() and qb.andWhere()', () => {
      const filter = TrashedFilter.make();
      filter.handle(mockQb, Clause.Equals, 'only_trashed');
      expect(mockQb.withDeleted).toHaveBeenCalledTimes(1);
      expect(mockQb.andWhere).toHaveBeenCalledWith('entity.deletedAt IS NOT NULL');
    });

    it('with "without_trashed" does not call withDeleted or andWhere', () => {
      const filter = TrashedFilter.make();
      filter.handle(mockQb, Clause.Equals, 'without_trashed');
      expect(mockQb.withDeleted).not.toHaveBeenCalled();
      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });

    it('with "all" calls qb.withDeleted() (alias for with_trashed)', () => {
      const filter = TrashedFilter.make();
      filter.handle(mockQb, Clause.Equals, 'all');
      expect(mockQb.withDeleted).toHaveBeenCalledTimes(1);
      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });

    it('with unknown value falls through to default (no-op)', () => {
      const filter = TrashedFilter.make();
      filter.handle(mockQb, Clause.Equals, 'unknown_value');
      expect(mockQb.withDeleted).not.toHaveBeenCalled();
      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });
  });
});
