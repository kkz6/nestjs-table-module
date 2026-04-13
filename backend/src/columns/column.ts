import { ColumnAlignment } from '../enums';
import { ColumnSerialized } from '../interfaces';

/**
 * Converts a string to a human-readable header.
 * "created_at" -> "Created at"
 * "department.name" -> "Name"
 * "firstName" -> "First name"
 */
function generateHeader(attribute: string): string {
  // For nested attributes like "department.name", use the last segment
  const segment = attribute.includes('.')
    ? attribute.split('.').pop()!
    : attribute;

  // Split on underscores, dots, or camelCase boundaries
  const words = segment
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_.-]+/g, ' ')
    .trim()
    .toLowerCase();

  // Capitalize the first letter only
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type MapAsFunction = (value: any, item?: any) => any;
export type MapAsMap = Record<string, any>;
export type SortUsingFunction = (query: any, direction: string) => void;

export abstract class Column {
  abstract readonly type: string;

  protected attribute: string;
  protected header: string;
  protected _sortable: boolean = false;
  protected _toggleable: boolean = true;
  protected _searchable: boolean = false;
  protected _visible: boolean = true;
  protected _alignment: ColumnAlignment = ColumnAlignment.Left;
  protected _wrap: boolean = false;
  protected _truncate: number | false = false;
  protected _headerClass: string | null = null;
  protected _cellClass: string | null = null;
  protected _stickable: boolean = false;
  protected _meta: Record<string, any> | null = null;
  protected _mapAs: MapAsFunction | MapAsMap | null = null;
  protected _exportAs: ((value: any, item?: any) => any) | null = null;
  protected _shouldExport: boolean = true;
  protected _sortUsing: SortUsingFunction | null = null;

  constructor(attribute: string, header?: string) {
    this.attribute = attribute;
    this.header = header ?? generateHeader(attribute);
  }

  /**
   * Factory method to create a new column instance.
   * Subclasses inherit this and it returns the correct subclass type.
   */
  static make(attribute: string, header?: string): any {
    return new (this as any)(attribute, header);
  }

  // ─── Chainable Builder Methods ──────────────────────────────────

  sortable(sortable: boolean = true): this {
    this._sortable = sortable;
    return this;
  }

  notSortable(): this {
    return this.sortable(false);
  }

  searchable(searchable: boolean = true): this {
    this._searchable = searchable;
    return this;
  }

  notSearchable(): this {
    return this.searchable(false);
  }

  toggleable(toggleable: boolean = true): this {
    this._toggleable = toggleable;
    return this;
  }

  notToggleable(): this {
    return this.toggleable(false);
  }

  visible(visible: boolean = true): this {
    this._visible = visible;
    return this;
  }

  hidden(hidden: boolean = true): this {
    return this.visible(!hidden);
  }

  align(alignment: ColumnAlignment): this {
    this._alignment = alignment;
    return this;
  }

  leftAligned(): this {
    return this.align(ColumnAlignment.Left);
  }

  centerAligned(): this {
    return this.align(ColumnAlignment.Center);
  }

  rightAligned(): this {
    return this.align(ColumnAlignment.Right);
  }

  wrap(wrap: boolean = true): this {
    this._wrap = wrap;
    return this;
  }

  truncate(value: number | false = 1): this {
    this._truncate = value;
    if (value !== false) {
      this._wrap = true;
    }
    return this;
  }

  headerClass(cssClass: string | null = null): this {
    this._headerClass = cssClass;
    return this;
  }

  cellClass(cssClass: string | null = null): this {
    this._cellClass = cssClass;
    return this;
  }

  stickable(stickable: boolean = true): this {
    this._stickable = stickable;
    return this;
  }

  notStickable(): this {
    return this.stickable(false);
  }

  meta(meta: Record<string, any>): this {
    this._meta = meta;
    return this;
  }

  mapAs(mapAs: MapAsFunction | MapAsMap): this {
    this._mapAs = mapAs;
    return this;
  }

  exportAs(exportAs: ((value: any, item?: any) => any) | false): this {
    if (exportAs === false) {
      this._shouldExport = false;
    } else {
      this._exportAs = exportAs;
    }
    return this;
  }

  dontExport(): this {
    this._shouldExport = false;
    return this;
  }

  sortUsing(sortUsing: SortUsingFunction): this {
    this._sortUsing = sortUsing;
    return this;
  }

  // ─── Getter Methods ─────────────────────────────────────────────

  getAttribute(): string {
    return this.attribute;
  }

  getHeader(): string {
    return this.header;
  }

  isSortable(): boolean {
    return this._sortable;
  }

  isSearchable(): boolean {
    return this._searchable;
  }

  isToggleable(): boolean {
    return this._toggleable;
  }

  isVisible(): boolean {
    return !this._toggleable || this._visible;
  }

  isStickable(): boolean {
    return this._stickable;
  }

  shouldBeExported(): boolean {
    return this._shouldExport;
  }

  getSortUsing(): SortUsingFunction | null {
    return this._sortUsing;
  }

  // ─── Relation Methods ───────────────────────────────────────────

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

  // ─── Value Methods ──────────────────────────────────────────────

  getDataFromItem(item: any): any {
    const parts = this.attribute.split('.');
    let current = item;

    for (const part of parts) {
      if (current == null) {
        return null;
      }
      current = current[part];
    }

    return current;
  }

  mapValue(value: any, item?: any): any {
    return value;
  }

  mapForTable(value: any, item?: any): any {
    if (this._mapAs !== null) {
      if (typeof this._mapAs === 'function') {
        return this._mapAs(value, item);
      }
      // Map lookup
      return value == null ? null : this._mapAs[value] ?? null;
    }

    return this.mapValue(value, item);
  }

  mapForExport(value: any, item?: any): any {
    if (this._exportAs) {
      return this._exportAs(value, item);
    }
    return this.mapForTable(value, item);
  }

  // ─── Serialization ──────────────────────────────────────────────

  toArray(): ColumnSerialized {
    return {
      type: this.type,
      key: this.getAttribute(),
      header: this.getHeader(),
      sortable: this.isSortable(),
      searchable: this.isSearchable(),
      toggleable: this.isToggleable(),
      visible: this.isVisible(),
      alignment: this._alignment,
      wrap: this._wrap,
      truncate: this._truncate,
      headerClass: this._headerClass,
      cellClass: this._cellClass,
      stickable: this.isStickable(),
      meta: this._meta,
    };
  }
}
