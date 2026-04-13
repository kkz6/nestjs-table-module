import { Column } from './column';

export class DateTimeColumn extends Column {
  readonly type = 'datetime';

  private static _defaultFormat: string = 'YYYY-MM-DD HH:mm:ss';
  private _format: string | null = null;

  static setDefaultFormat(format: string): void {
    DateTimeColumn._defaultFormat = format;
  }

  format(format: string): this {
    this._format = format;
    return this;
  }

  getFormat(): string {
    return this._format ?? DateTimeColumn._defaultFormat;
  }

  mapValue(value: any, _item?: any): any {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }

    const format = this.getFormat();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }
}
