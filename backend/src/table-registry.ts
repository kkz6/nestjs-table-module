import { Injectable } from '@nestjs/common';
import { BaseTable } from './base-table';

@Injectable()
export class TableRegistry {
  private tables = new Map<string, BaseTable<any>>();

  register(name: string, table: BaseTable<any>): void {
    table.setRegistryName(name);
    this.tables.set(name, table);
  }

  get(name: string): BaseTable<any> | undefined {
    return this.tables.get(name);
  }

  has(name: string): boolean {
    return this.tables.has(name);
  }

  getAll(): Map<string, BaseTable<any>> {
    return this.tables;
  }
}
