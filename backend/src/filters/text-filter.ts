import { Clause } from '../enums';
import { Filter } from './filter';

export class TextFilter extends Filter {
  readonly type = 'text';

  defaultClauses(): Clause[] {
    return [
      Clause.Contains,
      Clause.NotContains,
      Clause.StartsWith,
      Clause.EndsWith,
      Clause.NotStartsWith,
      Clause.NotEndsWith,
      Clause.Equals,
      Clause.NotEquals,
    ];
  }

  validate(value: any, _clause: Clause): any {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    return null;
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const paramName = `filter_${attribute.replace(/\./g, '_')}_${clause}`;

    switch (clause) {
      case Clause.Contains:
        qb.andWhere(`${attribute} ILIKE :${paramName}`, { [paramName]: `%${value}%` });
        break;
      case Clause.NotContains:
        qb.andWhere(`${attribute} NOT ILIKE :${paramName}`, { [paramName]: `%${value}%` });
        break;
      case Clause.StartsWith:
        qb.andWhere(`${attribute} ILIKE :${paramName}`, { [paramName]: `${value}%` });
        break;
      case Clause.EndsWith:
        qb.andWhere(`${attribute} ILIKE :${paramName}`, { [paramName]: `%${value}` });
        break;
      case Clause.NotStartsWith:
        qb.andWhere(`${attribute} NOT ILIKE :${paramName}`, { [paramName]: `${value}%` });
        break;
      case Clause.NotEndsWith:
        qb.andWhere(`${attribute} NOT ILIKE :${paramName}`, { [paramName]: `%${value}` });
        break;
      case Clause.Equals:
        qb.andWhere(`${attribute} = :${paramName}`, { [paramName]: value });
        break;
      case Clause.NotEquals:
        qb.andWhere(`${attribute} != :${paramName}`, { [paramName]: value });
        break;
    }
  }
}
