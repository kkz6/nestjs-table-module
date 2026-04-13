import { EmptyStateSerialized } from './interfaces';

export class EmptyState {
  private _title: string = '';
  private _message: string = '';
  private _icon: string | null = null;
  private _action: { label: string; url: string } | null = null;

  static make(): EmptyState {
    return new EmptyState();
  }

  // ─── Chainable Builder Methods ──────────────────────────────────

  title(t: string): this {
    this._title = t;
    return this;
  }

  message(m: string): this {
    this._message = m;
    return this;
  }

  icon(i: string): this {
    this._icon = i;
    return this;
  }

  action(config: { label: string; url: string }): this {
    this._action = config;
    return this;
  }

  // ─── Serialization ──────────────────────────────────────────────

  toArray(): EmptyStateSerialized {
    return {
      title: this._title,
      message: this._message,
      icon: this._icon ?? undefined,
      action: this._action,
    };
  }
}
