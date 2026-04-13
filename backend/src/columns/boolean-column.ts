import { Column } from './column';
import { ColumnSerialized } from '../interfaces';

export class BooleanColumn extends Column {
  readonly type = 'boolean';

  private static _defaultTrueLabel: string = 'Yes';
  private static _defaultFalseLabel: string = 'No';
  private static _defaultTrueIcon: string | null = null;
  private static _defaultFalseIcon: string | null = null;

  private _trueLabel: string | null = null;
  private _falseLabel: string | null = null;
  private _trueIcon: string | null = null;
  private _falseIcon: string | null = null;

  // ─── Static Defaults ────────────────────────────────────────────

  static setDefaultTrueLabel(label: string): void {
    BooleanColumn._defaultTrueLabel = label;
  }

  static setDefaultFalseLabel(label: string): void {
    BooleanColumn._defaultFalseLabel = label;
  }

  static setDefaultTrueIcon(icon: string | null): void {
    BooleanColumn._defaultTrueIcon = icon;
  }

  static setDefaultFalseIcon(icon: string | null): void {
    BooleanColumn._defaultFalseIcon = icon;
  }

  // ─── Chainable Setters ──────────────────────────────────────────

  trueLabel(label: string): this {
    this._trueLabel = label;
    return this;
  }

  falseLabel(label: string): this {
    this._falseLabel = label;
    return this;
  }

  trueIcon(icon: string): this {
    this._trueIcon = icon;
    return this;
  }

  falseIcon(icon: string): this {
    this._falseIcon = icon;
    return this;
  }

  // ─── Resolved Getters ───────────────────────────────────────────

  getTrueLabel(): string {
    return this._trueLabel ?? BooleanColumn._defaultTrueLabel;
  }

  getFalseLabel(): string {
    return this._falseLabel ?? BooleanColumn._defaultFalseLabel;
  }

  getTrueIcon(): string | null {
    return this._trueIcon ?? BooleanColumn._defaultTrueIcon;
  }

  getFalseIcon(): string | null {
    return this._falseIcon ?? BooleanColumn._defaultFalseIcon;
  }

  // ─── Value Mapping ──────────────────────────────────────────────

  mapValue(value: any, _item?: any): any {
    return value ? this.getTrueLabel() : this.getFalseLabel();
  }

  mapForTable(value: any, item?: any): any {
    const bool = !!value;

    if (bool && this.getTrueIcon()) {
      return bool;
    }

    if (!bool && this.getFalseIcon()) {
      return bool;
    }

    return super.mapForTable(value, item);
  }

  // ─── Serialization ──────────────────────────────────────────────

  toArray(): ColumnSerialized {
    return {
      ...super.toArray(),
      trueIcon: this.getTrueIcon(),
      falseIcon: this.getFalseIcon(),
      trueLabel: this.getTrueLabel(),
      falseLabel: this.getFalseLabel(),
    };
  }
}
