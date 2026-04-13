import { SetMetadata } from '@nestjs/common';
import { TableConfigOptions } from '../interfaces';

export const TABLE_CONFIG_KEY = 'TABLE_CONFIG';

export function TableConfig(options: TableConfigOptions): ClassDecorator {
  return SetMetadata(TABLE_CONFIG_KEY, options);
}
