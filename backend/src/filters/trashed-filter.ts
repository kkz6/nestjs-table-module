import { SetFilter } from './set-filter';

export class TrashedFilter extends SetFilter {
  static make(attribute: string = 'trashed', label: string = 'Trashed'): TrashedFilter {
    const filter = new TrashedFilter(attribute, label);

    filter.options([
      { value: 'without_trashed', label: 'Without trashed' },
      { value: 'with_trashed', label: 'With trashed' },
      { value: 'only_trashed', label: 'Only trashed' },
    ]);

    filter.withoutClause();

    filter.applyUsing((qb, _attribute, _clause, value) => {
      switch (value) {
        case 'with_trashed':
        case 'all':
          qb.withDeleted();
          break;
        case 'only_trashed':
          qb.withDeleted();
          qb.andWhere('entity.deletedAt IS NOT NULL');
          break;
        case 'without_trashed':
        default:
          // No-op: TypeORM excludes soft-deleted by default
          break;
      }
    });

    return filter;
  }
}
