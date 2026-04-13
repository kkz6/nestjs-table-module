import { Clause } from '../enums';
import { Filter } from './filter';

export class BooleanFilter extends Filter {
  readonly type = 'boolean';

  defaultClauses(): Clause[] {
    return [Clause.IsTrue, Clause.IsFalse];
  }

  validate(_value: any, _clause: Clause): any {
    return null;
  }

  default(value: boolean, clause?: Clause): this {
    this._defaultValue = value;
    if (clause !== undefined) {
      this._defaultClause = clause;
    } else {
      this._defaultClause = value ? Clause.IsTrue : Clause.IsFalse;
    }
    return this;
  }

  apply(qb: any, attribute: string, clause: Clause, _value: any): void {
    const paramName = `filter_${attribute.replace(/\./g, '_')}_${clause}`;

    switch (clause) {
      case Clause.IsTrue:
        qb.andWhere(`${attribute} = :${paramName}`, { [paramName]: true });
        break;
      case Clause.IsFalse:
        qb.andWhere(`${attribute} = :${paramName}`, { [paramName]: false });
        break;
    }
  }
}
