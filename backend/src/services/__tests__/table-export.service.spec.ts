// Must mock typeorm and @nestjs/typeorm before any imports that use them
jest.mock('typeorm', () => ({
  DataSource: jest.fn(),
  Repository: jest.fn(),
  Entity: () => () => {},
  PrimaryGeneratedColumn: () => () => {},
  Column: () => () => {},
  CreateDateColumn: () => () => {},
}));
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

import { TableExportService } from '../table-export.service';
import { TableSseService } from '../table-sse.service';
import { TableRegistry } from '../../table-registry';
import { ExportFormat } from '../../enums';

// Mock exceljs and fs to avoid real file I/O
jest.mock('exceljs', () => {
  const addRow = jest.fn();
  return {
    Workbook: jest.fn().mockImplementation(() => ({
      addWorksheet: jest.fn().mockReturnValue({
        columns: [],
        addRow,
      }),
      csv: { writeFile: jest.fn().mockResolvedValue(undefined) },
      xlsx: { writeFile: jest.fn().mockResolvedValue(undefined) },
    })),
  };
});

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn((event, cb) => {
      if (event === 'finish') cb();
    }),
    pipe: jest.fn(),
  }),
}));

describe('TableExportService', () => {
  let service: TableExportService;
  let jobRepo: any;
  let sseService: jest.Mocked<TableSseService>;
  let registry: TableRegistry;
  let dataSource: any;

  beforeEach(() => {
    jobRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    sseService = {
      emit: jest.fn(),
      getStream: jest.fn(),
    } as any;

    registry = new TableRegistry();

    dataSource = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          getMany: jest.fn().mockResolvedValue([]),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
        }),
      }),
    };

    service = new TableExportService(jobRepo, sseService, registry, dataSource);
  });

  describe('createJob()', () => {
    it('creates and saves a job entity with correct fields', async () => {
      const exportDef = {
        getName: () => 'csv-export',
        getFileName: () => 'users.csv',
        getFormat: () => ExportFormat.Csv,
      };
      const table: any = {
        getExports: jest.fn().mockReturnValue([exportDef]),
        getRegistryName: jest.fn().mockReturnValue('UsersTable'),
      };

      const createdJob = {
        tableClass: 'UsersTable',
        exportName: 'csv-export',
        fileName: 'users.csv',
        format: ExportFormat.Csv,
        queryState: { page: 1 },
        selectedIds: null,
        status: 'pending',
        userId: 5,
      };
      const savedJob = { ...createdJob, id: 'job-abc' };

      jobRepo.create.mockReturnValue(createdJob);
      jobRepo.save.mockResolvedValue(savedJob);

      const result = await service.createJob(table, 'csv-export', { page: 1 }, {}, 5);

      expect(jobRepo.create).toHaveBeenCalledWith({
        tableClass: 'UsersTable',
        exportName: 'csv-export',
        fileName: 'users.csv',
        format: ExportFormat.Csv,
        queryState: { page: 1 },
        selectedIds: null,
        status: 'pending',
        userId: 5,
      });
      expect(jobRepo.save).toHaveBeenCalledWith(createdJob);
      expect(result).toEqual(savedJob);
    });

    it('throws when export name not found', async () => {
      const table: any = {
        getExports: jest.fn().mockReturnValue([]),
        getRegistryName: jest.fn().mockReturnValue('UsersTable'),
      };

      await expect(
        service.createJob(table, 'nonexistent', {}, {}, 0),
      ).rejects.toThrow('Export nonexistent not found');
    });
  });

  describe('getJob()', () => {
    it('calls findOneBy with jobId', async () => {
      const mockJob = { id: 'job-123', status: 'completed' };
      jobRepo.findOneBy.mockResolvedValue(mockJob);

      const result = await service.getJob('job-123');

      expect(jobRepo.findOneBy).toHaveBeenCalledWith({ id: 'job-123' });
      expect(result).toEqual(mockJob);
    });
  });

  describe('processExport()', () => {
    function setupTableForProcess() {
      const col = {
        shouldBeExported: () => true,
        getHeader: () => 'Name',
        getAttribute: () => 'name',
        getDataFromItem: (item: any) => item.name,
        mapForExport: (value: any) => value,
      };
      const table: any = {
        setRegistryName: jest.fn(),
        getConfig: jest.fn().mockReturnValue({ resource: class FakeEntity {} }),
        getColumns: jest.fn().mockReturnValue([col]),
      };
      registry.register('UsersTable', table);
      return table;
    }

    it('updates status to processing, emits SSE, generates file, updates to completed', async () => {
      setupTableForProcess();

      const job: any = {
        id: 'job-1',
        tableClass: 'UsersTable',
        exportName: 'csv',
        fileName: 'users.csv',
        format: ExportFormat.Csv,
        queryState: {},
        status: 'pending',
        progress: 0,
        filePath: null,
      };

      jobRepo.findOneBy.mockResolvedValue(job);

      // Capture snapshots of the status at each save call, since the object is mutated
      const savedStatuses: string[] = [];
      jobRepo.save.mockImplementation(async (j: any) => {
        savedStatuses.push(j.status);
        return j;
      });

      await service.processExport('job-1');

      // Should have saved at least twice: once for 'processing', once for 'completed'
      expect(savedStatuses.length).toBeGreaterThanOrEqual(2);

      // First save: status set to processing
      expect(savedStatuses[0]).toBe('processing');

      // Last save: status set to completed
      expect(savedStatuses[savedStatuses.length - 1]).toBe('completed');
      expect(job.progress).toBe(100);
      expect(job.filePath).toBeDefined();

      // SSE events emitted
      expect(sseService.emit).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', status: 'processing', progress: 0 }),
      );
      expect(sseService.emit).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', status: 'completed', progress: 100 }),
      );
    });

    it('on error, sets status to failed and emits failure SSE event', async () => {
      // Register a table whose getConfig throws, causing processExport to fail after fetching the table
      const table: any = {
        setRegistryName: jest.fn(),
        getConfig: jest.fn().mockImplementation(() => {
          throw new Error('config error');
        }),
        getColumns: jest.fn().mockReturnValue([]),
      };
      registry.register('BadTable', table);

      const job: any = {
        id: 'job-err',
        tableClass: 'BadTable',
        exportName: 'csv',
        fileName: 'export.csv',
        format: ExportFormat.Csv,
        queryState: {},
        status: 'pending',
        progress: 0,
        filePath: null,
      };

      jobRepo.findOneBy.mockResolvedValue(job);
      jobRepo.save.mockImplementation(async (j: any) => j);

      await service.processExport('job-err');

      // Should have set status to failed
      const failSave = jobRepo.save.mock.calls.find(
        (c: any[]) => c[0].status === 'failed',
      );
      expect(failSave).toBeDefined();

      // Should have emitted failure SSE
      expect(sseService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: 'job-err',
          status: 'failed',
          progress: 0,
          error: 'config error',
        }),
      );
    });

    it('returns early if job not found', async () => {
      jobRepo.findOneBy.mockResolvedValue(null);

      await service.processExport('job-missing');

      // Should not have saved anything
      expect(jobRepo.save).not.toHaveBeenCalled();
      expect(sseService.emit).not.toHaveBeenCalled();
    });
  });
});
