import { Module, DynamicModule, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableViewEntity } from './entities/table-view.entity';
import { ExportJobEntity } from './entities/export-job.entity';
import { TableQueryService } from './services/table-query.service';
import { TableExportService } from './services/table-export.service';
import { TableViewService } from './services/table-view.service';
import { TableSseService } from './services/table-sse.service';
import { TableActionController } from './controllers/table-action.controller';
import { TableExportController } from './controllers/table-export.controller';
import { TableViewController } from './controllers/table-view.controller';
import { TableRegistry } from './table-registry';
import { BaseTable } from './base-table';

@Global()
@Module({})
export class TableModule {
  static forRoot(tables?: BaseTable<any>[]): DynamicModule {
    return {
      global: true,
      module: TableModule,
      imports: [
        TypeOrmModule.forFeature([TableViewEntity, ExportJobEntity]),
      ],
      controllers: [
        TableActionController,
        TableExportController,
        TableViewController,
      ],
      providers: [
        TableQueryService,
        TableExportService,
        TableViewService,
        TableSseService,
        TableRegistry,
        {
          provide: 'TABLE_REGISTRATIONS',
          useFactory: (registry: TableRegistry) => {
            if (tables) {
              for (const table of tables) {
                registry.register(table.getRegistryName(), table);
              }
            }
          },
          inject: [TableRegistry],
        },
      ],
      exports: [
        TableQueryService,
        TableRegistry,
        TableSseService,
      ],
    };
  }
}
