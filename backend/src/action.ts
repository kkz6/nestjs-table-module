import { ActionType, Variant } from './enums';
import { ActionConfirm, ActionSerialized } from './interfaces';

export class Action {
  private _name: string;
  private _label: string;
  private _type: ActionType = ActionType.Button;
  private _variant: Variant = Variant.Default;
  private _icon: string | null = null;
  private _confirm: ActionConfirm | null = null;
  private _handler: ((item: any, repo: any) => Promise<any>) | null = null;
  private _beforeHandler: ((item: any) => Promise<void>) | null = null;
  private _afterHandler: ((item: any, result: any) => Promise<void>) | null =
    null;
  private _authorize: ((user: any) => boolean) | null = null;
  private _disabled: ((item: any) => boolean) | null = null;
  private _hidden: ((item: any) => boolean) | null = null;
  private _url: ((item: any) => string) | null = null;
  private _download: boolean = false;
  private _isBulk: boolean = false;
  private _meta: Record<string, any> | null = null;
  private _dataAttributes: Record<string, string> | null = null;

  constructor(name: string, label?: string) {
    this._name = name;
    this._label = label ?? name.charAt(0).toUpperCase() + name.slice(1);
  }

  static make(name: string, label?: string): Action {
    return new Action(name, label);
  }

  // ─── Chainable Builder Methods ──────────────────────────────────

  asButton(): this {
    this._type = ActionType.Button;
    return this;
  }

  asLink(): this {
    this._type = ActionType.Link;
    return this;
  }

  variant(v: Variant): this {
    this._variant = v;
    return this;
  }

  icon(icon: string): this {
    this._icon = icon;
    return this;
  }

  confirm(config: ActionConfirm): this {
    this._confirm = config;
    return this;
  }

  handle(handler: (item: any, repo: any) => Promise<any>): this {
    this._handler = handler;
    return this;
  }

  before(handler: (item: any) => Promise<void>): this {
    this._beforeHandler = handler;
    return this;
  }

  after(handler: (item: any, result: any) => Promise<void>): this {
    this._afterHandler = handler;
    return this;
  }

  authorize(callback: (user: any) => boolean): this {
    this._authorize = callback;
    return this;
  }

  disabled(callback: (item: any) => boolean): this {
    this._disabled = callback;
    return this;
  }

  hidden(callback: (item: any) => boolean): this {
    this._hidden = callback;
    return this;
  }

  url(resolver: (item: any) => string): this {
    this._url = resolver;
    return this;
  }

  download(value: boolean = true): this {
    this._download = value;
    return this;
  }

  bulk(value: boolean = true): this {
    this._isBulk = value;
    return this;
  }

  meta(value: Record<string, any>): this {
    this._meta = value;
    return this;
  }

  dataAttributes(value: Record<string, string>): this {
    this._dataAttributes = value;
    return this;
  }

  // ─── Getter Methods ─────────────────────────────────────────────

  getName(): string {
    return this._name;
  }

  getLabel(): string {
    return this._label;
  }

  isBulk(): boolean {
    return this._isBulk;
  }

  isAuthorized(user: any): boolean {
    if (this._authorize === null) {
      return true;
    }
    return this._authorize(user);
  }

  isDisabledFor(item: any): boolean {
    if (this._disabled === null) {
      return false;
    }
    return this._disabled(item);
  }

  isHiddenFor(item: any): boolean {
    if (this._hidden === null) {
      return false;
    }
    return this._hidden(item);
  }

  resolveUrl(item: any): string | null {
    if (this._url === null) {
      return null;
    }
    return this._url(item);
  }

  async execute(itemOrIds: any, repo: any): Promise<any> {
    if (this._beforeHandler) {
      await this._beforeHandler(itemOrIds);
    }

    let result: any = undefined;
    if (this._handler) {
      result = await this._handler(itemOrIds, repo);
    }

    if (this._afterHandler) {
      await this._afterHandler(itemOrIds, result);
    }

    return result;
  }

  // ─── Serialization ──────────────────────────────────────────────

  toArray(): ActionSerialized {
    return {
      name: this._name,
      label: this._label,
      type: this._type,
      variant: this._variant,
      icon: this._icon,
      confirm: this._confirm,
      download: this._download,
      meta: this._meta,
      dataAttributes: this._dataAttributes,
    };
  }
}
