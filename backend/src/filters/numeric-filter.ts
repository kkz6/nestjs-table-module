import { Clause } from '../enums';
import { Filter } from './filter';

export class NumericFilter extends Filter {
  readonly type = 'numeric';

  defaultClauses(): Clause[] {
    return [
      Clause.Equals,
      Clause.NotEquals,
      Clause.GreaterThan,
      Clause.GreaterThanOrEqual,
      Clause.LessThan,
      Clause.LessThanOrEqual,
      Clause.Between,
      Clause.NotBetween,
    ];
  }

  validate(value: any, clause: Clause): any {
    if (clause === Clause.Between || clause === Clause.NotBetween) {
      if (!Array.isArray(value) || value.length !== 2) {
        return null;
      }
      const min = Number(value[0]);
      const max = Number(value[1]);
      if (isNaN(min) || isNaN(max)) {
        return null;
      }
      return [min, max];
    }

    const num = Number(value);
    if (isNaN(num)) {
      return null;
    }
    return num;
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const paramName = `filter_${attribute.replace(/\./g, '_')}_${clause}`;

    switch (clause) {
      case Clause.Equals:
        qb.andWhere(`${attribute} = :${paramName}`, { [paramName]: value });
        break;
      case Clause.NotEquals:
        qb.andWhere(`${attribute} != :${paramName}`, { [paramName]: value });
        break;
      case Clause.GreaterThan:
        qb.andWhere(`${attribute} > :${paramName}`, { [paramName]: value });
        break;
      case Clause.GreaterThanOrEqual:
        qb.andWhere(`${attribute} >= :${paramName}`, { [paramName]: value });
        break;
      case Clause.LessThan:
        qb.andWhere(`${attribute} < :${paramName}`, { [paramName]: value });
        break;
      case Clause.LessThanOrEqual:
        qb.andWhere(`${attribute} <= :${paramName}`, { [paramName]: value });
        break;
      case Clause.Between: {
        const minParam = `${paramName}_min`;
        const maxParam = `${paramName}_max`;
        qb.andWhere(`${attribute} BETWEEN :${minParam} AND :${maxParam}`, {
          [minParam]: value[0],
          [maxParam]: value[1],
        });
        break;
      }
      case Clause.NotBetween: {
        const minParam = `${paramName}_min`;
        const maxParam = `${paramName}_max`;
        qb.andWhere(`${attribute} NOT BETWEEN :${minParam} AND :${maxParam}`, {
          [minParam]: value[0],
          [maxParam]: value[1],
        });
        break;
      }
    }
  }
}
