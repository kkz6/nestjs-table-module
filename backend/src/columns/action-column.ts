import { Column } from './column';
import { ColumnAlignment } from '../enums';
import { ColumnSerialized } from '../interfaces';

export class ActionColumn extends Column {
  readonly type = 'action';

  private static _defaultAsDropdown: boolean = false;
  private _asDropdown: boolean | null = null;

  /**
   * Factory override — sets attribute to _actions, alignment to Right,
   * toggleable to false, and shouldExport to false.
   * The `attribute` parameter is ignored; always uses '_actions'.
   */
  static make(header?: string): ActionColumn {
    const instance = new ActionColumn('_actions', header ?? '');
    instance._alignment = ColumnAlignment.Right;
    instance._toggleable = false;
    instance._shouldExport = false;
    return instance;
  }

  /**
   * Set whether the actions should be displayed as a dropdown by default.
   */
  static defaultAsDropdown(value: boolean = true): void {
    ActionColumn._defaultAsDropdown = value;
  }

  /**
   * Set whether the actions should be displayed as a dropdown.
   */
  asDropdown(value: boolean = true): this {
    this._asDropdown = value;
    return this;
  }

  /**
   * Always return _actions as the attribute.
   */
  getAttribute(): string {
    return '_actions';
  }

  /**
   * Never export the action column.
   */
  shouldBeExported(): boolean {
    return false;
  }

  // ─── Serialization ──────────────────────────────────────────────

  toArray(): ColumnSerialized {
    return {
      ...super.toArray(),
      asDropdown: this._asDropdown ?? ActionColumn._defaultAsDropdown,
    };
  }
}
