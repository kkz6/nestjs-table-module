import { Clause } from '../enums';
import { Filter } from './filter';

function parseDate(value: any): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }

  // Return ISO date string YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class DateFilter extends Filter {
  readonly type = 'date';

  defaultClauses(): Clause[] {
    return [
      Clause.Before,
      Clause.After,
      Clause.EqualOrBefore,
      Clause.EqualOrAfter,
      Clause.Equals,
      Clause.NotEquals,
      Clause.Between,
      Clause.NotBetween,
    ];
  }

  validate(value: any, clause: Clause): any {
    if (clause === Clause.Between || clause === Clause.NotBetween) {
      if (!Array.isArray(value) || value.length !== 2) {
        return null;
      }
      const start = parseDate(value[0]);
      const end = parseDate(value[1]);
      if (!start || !end) {
        return null;
      }
      return [start, end];
    }

    return parseDate(value);
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const paramName = `filter_${attribute.replace(/\./g, '_')}_${clause}`;

    switch (clause) {
      case Clause.Equals:
        qb.andWhere(`DATE(${attribute}) = :${paramName}`, { [paramName]: value });
        break;
      case Clause.NotEquals:
        qb.andWhere(`DATE(${attribute}) != :${paramName}`, { [paramName]: value });
        break;
      case Clause.Before:
        qb.andWhere(`${attribute} < :${paramName}`, { [paramName]: value });
        break;
      case Clause.After:
        qb.andWhere(`${attribute} > :${paramName}`, { [paramName]: value });
        break;
      case Clause.EqualOrBefore:
        qb.andWhere(`${attribute} <= :${paramName}`, { [paramName]: value });
        break;
      case Clause.EqualOrAfter:
        qb.andWhere(`${attribute} >= :${paramName}`, { [paramName]: value });
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
