import { Clause } from '../enums';
import { FilterSerialized } from '../interfaces';

/**
 * Converts a string to a human-readable label.
 * "created_at" -> "Created at"
 * "department.name" -> "Name"
 * "firstName" -> "First name"
 */
function generateLabel(attribute: string): string {
  const segment = attribute.includes('.')
    ? attribute.split('.').pop()!
    : attribute;

  const words = segment
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_.-]+/g, ' ')
    .trim()
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type ApplyUsingFunction = (qb: any, attribute: string, clause: Clause, value: any) => void;

export abstract class Filter {
  abstract readonly type: string;

  protected attribute: string;
  protected _label: string | null = null;
  protected _clauses: Clause[] | null = null;
  protected _defaultValue: any = undefined;
  protected _defaultClause: Clause | null = null;
  protected _applyUsing: ApplyUsingFunction | null = null;
  protected _hidden: boolean = false;

  constructor(attribute: string, label?: string) {
    this.attribute = attribute;
    this._label = label ?? null;
  }

  /**
   * Factory method to create a new filter instance.
   */
  static make(attribute: string, label?: string): any {
    return new (this as any)(attribute, label);
  }

  // ─── Abstract Methods ────────────────────────────────────────────

  abstract defaultClauses(): Clause[];

  abstract apply(qb: any, attribute: string, clause: Clause, value: any): void;

  abstract validate(value: any, clause: Clause): any;

  // ─── Getters ─────────────────────────────────────────────────────

  getAttribute(): string {
    return this.attribute;
  }

  getLabel(): string {
    return this._label ?? generateLabel(this.attribute);
  }

  getClauses(): Clause[] {
    return this._clauses ?? this.defaultClauses();
  }

  // ─── Chainable Builder Methods ───────────────────────────────────

  clauses(clauses: Clause[]): this {
    this._clauses = clauses;
    return this;
  }

  nullable(): this {
    const current = this.getClauses();
    if (!current.includes(Clause.IsSet)) {
      current.push(Clause.IsSet);
    }
    if (!current.includes(Clause.IsNotSet)) {
      current.push(Clause.IsNotSet);
    }
    this._clauses = current;
    return this;
  }

  default(value: any, clause?: Clause): this {
    this._defaultValue = value;
    if (clause !== undefined) {
      this._defaultClause = clause;
    }
    return this;
  }

  hasDefaultValue(): boolean {
    return this._defaultValue !== undefined;
  }

  getDefaultValue(): any {
    return this._defaultValue;
  }

  getDefaultClause(): Clause {
    return this._defaultClause ?? this.getClauses()[0];
  }

  applyUsing(callback: ApplyUsingFunction): this {
    this._applyUsing = callback;
    return this;
  }

  hidden(value: boolean = true): this {
    this._hidden = value;
    return this;
  }

  isHidden(): boolean {
    return this._hidden;
  }

  // ─── Relation Methods ────────────────────────────────────────────

  isNested(): boolean {
    return this.attribute.includes('.') && !this.attribute.startsWith('pivot.');
  }

  getRelationshipName(): string {
    const lastDot = this.attribute.lastIndexOf('.');
    return lastDot >= 0 ? this.attribute.substring(0, lastDot) : this.attribute;
  }

  getRelationshipColumn(): string {
    const lastDot = this.attribute.lastIndexOf('.');
    return lastDot >= 0 ? this.attribute.substring(lastDot + 1) : this.attribute;
  }

  // ─── Handler ─────────────────────────────────────────────────────

  handle(qb: any, clause: Clause, value: any): void {
    // Prefix with entity alias if not already prefixed (e.g., "firstName" -> "entity.firstName")
    const attribute = this.attribute.includes('.') ? this.attribute : `entity.${this.attribute}`;

    // Handle IsSet / IsNotSet directly
    if (clause === Clause.IsSet) {
      qb.andWhere(`${attribute} IS NOT NULL`);
      return;
    }

    if (clause === Clause.IsNotSet) {
      qb.andWhere(`${attribute} IS NULL`);
      return;
    }

    // Use custom apply if provided
    if (this._applyUsing) {
      this._applyUsing(qb, attribute, clause, value);
      return;
    }

    this.apply(qb, attribute, clause, value);
  }

  // ─── Serialization ──────────────────────────────────────────────

  toArray(): FilterSerialized {
    const result: FilterSerialized = {
      key: this.getAttribute(),
      label: this.getLabel(),
      type: this.type,
      clauses: this.getClauses(),
    };

    if (this._hidden) {
      result.hidden = true;
    }

    if (this.hasDefaultValue()) {
      result.default = {
        value: this.getDefaultValue(),
        clause: this.getDefaultClause(),
      };
    } else {
      result.default = null;
    }

    return result;
  }
}
