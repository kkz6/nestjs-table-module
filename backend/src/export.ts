import { ExportFormat } from './enums';
import { ExportSerialized } from './interfaces';

export class Export {
  private _name: string;
  private _label: string;
  private _fileName: string;
  private _format: ExportFormat;
  private _authorize: ((user: any) => boolean) | null = null;
  private _filteredOnly: boolean = true;
  private _selectedOnly: boolean = false;

  constructor(name: string, fileName: string, format: ExportFormat) {
    this._name = name;
    this._label = name;
    this._fileName = fileName;
    this._format = format;
  }

  static make(name: string, fileName: string, format: ExportFormat): Export {
    return new Export(name, fileName, format);
  }

  // ─── Chainable Builder Methods ──────────────────────────────────

  label(l: string): this {
    this._label = l;
    return this;
  }

  authorize(callback: (user: any) => boolean): this {
    this._authorize = callback;
    return this;
  }

  filteredOnly(value: boolean = true): this {
    this._filteredOnly = value;
    return this;
  }

  selectedOnly(value: boolean = true): this {
    this._selectedOnly = value;
    return this;
  }

  // ─── Getter Methods ─────────────────────────────────────────────

  getName(): string {
    return this._name;
  }

  getLabel(): string {
    return this._label;
  }

  getFileName(): string {
    return this._fileName;
  }

  getFormat(): ExportFormat {
    return this._format;
  }

  isAuthorized(user: any): boolean {
    if (this._authorize === null) {
      return true;
    }
    return this._authorize(user);
  }

  isFilteredOnly(): boolean {
    return this._filteredOnly;
  }

  isSelectedOnly(): boolean {
    return this._selectedOnly;
  }

  // ─── Serialization ──────────────────────────────────────────────

  toArray(): ExportSerialized {
    return {
      name: this._name,
      label: this._label,
      fileName: this._fileName,
      format: this._format,
    };
  }
}
