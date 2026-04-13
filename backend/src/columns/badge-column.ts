import { Column } from './column';

export type VariantResolver =
  | Record<string, string>
  | ((value: any, item?: any) => string);

export type IconResolver =
  | Record<string, string>
  | ((value: any, item?: any) => string | null);

export class BadgeColumn extends Column {
  readonly type = 'badge';

  private _variantResolver: VariantResolver | null = null;
  private _iconResolver: IconResolver | null = null;

  /**
   * Set a resolver to determine the variant for the badge.
   */
  variant(resolver: VariantResolver): this {
    this._variantResolver = resolver;
    return this;
  }

  /**
   * Set a resolver to determine the icon for the badge.
   */
  icon(resolver: IconResolver): this {
    this._iconResolver = resolver;
    return this;
  }

  /**
   * Resolve the variant for the given value.
   */
  resolveVariant(value: any, item?: any): string | null {
    if (this._variantResolver == null) {
      return null;
    }

    if (typeof this._variantResolver === 'function') {
      return this._variantResolver(value, item);
    }

    return this._variantResolver[value] ?? null;
  }

  /**
   * Resolve the icon for the given value.
   */
  resolveIcon(value: any, item?: any): string | null {
    if (this._iconResolver == null) {
      return null;
    }

    if (typeof this._iconResolver === 'function') {
      return this._iconResolver(value, item);
    }

    return this._iconResolver[value] ?? null;
  }

  /**
   * Map value for table display — returns enriched object with variant and icon.
   */
  mapForTable(value: any, item?: any): any {
    return {
      value: super.mapForTable(value, item),
      variant: this.resolveVariant(value, item),
      icon: this.resolveIcon(value, item),
    };
  }

  /**
   * Map value for export — uses exportAs if set, otherwise plain mapValue.
   */
  mapForExport(value: any, item?: any): any {
    if (this._exportAs) {
      return this._exportAs(value, item);
    }

    // For export, use plain mapping (not the enriched badge object)
    return super.mapForTable(value, item);
  }
}
