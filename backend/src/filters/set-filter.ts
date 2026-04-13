import { Clause } from '../enums';
import { FilterOption, FilterSerialized } from '../interfaces';
import { Filter } from './filter';

export class SetFilter extends Filter {
  readonly type = 'set';

  private _options: FilterOption[] = [];
  private _multiple: boolean = true;

  defaultClauses(): Clause[] {
    return [Clause.In, Clause.NotIn, Clause.Equals, Clause.NotEquals];
  }

  options(opts: FilterOption[] | Record<string, string>): this {
    if (Array.isArray(opts)) {
      this._options = opts;
    } else {
      this._options = Object.entries(opts).map(([value, label]) => ({
        value,
        label,
      }));
    }
    return this;
  }

  multiple(value: boolean = true): this {
    this._multiple = value;
    return this;
  }

  isMultiple(): boolean {
    return this._multiple;
  }

  withoutClause(): this {
    this._clauses = [Clause.Equals];
    return this;
  }

  getOptions(): FilterOption[] {
    return this._options;
  }

  validate(value: any, clause: Clause): any {
    if (clause === Clause.In || clause === Clause.NotIn) {
      if (!Array.isArray(value)) {
        return null;
      }
      const strings = value.filter((v) => typeof v === 'string');
      return strings.length > 0 ? strings : null;
    }

    if (typeof value === 'string') {
      return value;
    }

    return null;
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const paramName = `filter_${attribute.replace(/\./g, '_')}_${clause}`;

    switch (clause) {
      case Clause.In:
        qb.andWhere(`${attribute} IN (:...${paramName})`, { [paramName]: value });
        break;
      case Clause.NotIn:
        qb.andWhere(`${attribute} NOT IN (:...${paramName})`, { [paramName]: value });
        break;
      case Clause.Equals:
        qb.andWhere(`${attribute} = :${paramName}`, { [paramName]: value });
        break;
      case Clause.NotEquals:
        qb.andWhere(`${attribute} != :${paramName}`, { [paramName]: value });
        break;
    }
  }

  toArray(): FilterSerialized {
    return {
      ...super.toArray(),
      options: this._options,
      multiple: this._multiple,
    };
  }
}
