import { NotFoundException } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { TableExportController } from '../table-export.controller';
import { TableRegistry } from '../../table-registry';
import { TableExportService } from '../../services/table-export.service';
import { TableSseService } from '../../services/table-sse.service';

describe('TableExportController', () => {
  let controller: TableExportController;
  let registry: TableRegistry;
  let exportService: jest.Mocked<TableExportService>;
  let sseService: jest.Mocked<TableSseService>;

  beforeEach(() => {
    registry = new TableRegistry();

    exportService = {
      createJob: jest.fn(),
      processExport: jest.fn().mockResolvedValue(undefined),
      getJob: jest.fn(),
    } as any;

    sseService = {
      getStream: jest.fn(),
      emit: jest.fn(),
    } as any;

    controller = new TableExportController(registry, exportService, sseService);
  });

  describe('trigger()', () => {
    it('creates job and returns { jobId }', async () => {
      const table: any = { setRegistryName: jest.fn(), getExports: jest.fn() };
      registry.register('UsersTable', table);

      exportService.createJob.mockResolvedValue({ id: 'job-123' } as any);

      const result = await controller.trigger('UsersTable', 'csv', {});

      expect(exportService.createJob).toHaveBeenCalledWith(table, 'csv', {}, {}, 0);
      expect(result).toEqual({ jobId: 'job-123' });
    });

    it('starts processExport asynchronously (not awaited)', async () => {
      const table: any = { setRegistryName: jest.fn(), getExports: jest.fn() };
      registry.register('UsersTable', table);

      exportService.createJob.mockResolvedValue({ id: 'job-456' } as any);
      // processExport returns a pending promise but trigger() should NOT await it
      let resolveProcess: () => void;
      exportService.processExport.mockReturnValue(
        new Promise<void>((r) => { resolveProcess = r; }),
      );

      const result = await controller.trigger('UsersTable', 'csv', {});

      // trigger() should have returned already, even though processExport hasn't resolved
      expect(result).toEqual({ jobId: 'job-456' });
      expect(exportService.processExport).toHaveBeenCalledWith('job-456');

      // Clean up
      resolveProcess!();
    });

    it('throws NotFoundException for unknown table', async () => {
      await expect(
        controller.trigger('NonExistent', 'csv', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('stream()', () => {
    it('returns observable from sseService.getStream', () => {
      const mockObservable = of({ data: '{}' }) as Observable<MessageEvent>;
      sseService.getStream.mockReturnValue(mockObservable);

      const result = controller.stream('job-123');

      expect(sseService.getStream).toHaveBeenCalledWith('job-123');
      expect(result).toBe(mockObservable);
    });
  });

  describe('download()', () => {
    it('sends file when job is completed', async () => {
      exportService.getJob.mockResolvedValue({
        id: 'job-123',
        status: 'completed',
        filePath: '/tmp/export.csv',
        fileName: 'export.csv',
      } as any);

      const res = {
        download: jest.fn(),
      };

      await controller.download('job-123', res as any);

      expect(res.download).toHaveBeenCalledWith('/tmp/export.csv', 'export.csv');
    });

    it('throws NotFoundException when job not found', async () => {
      exportService.getJob.mockResolvedValue(null);

      const res = { download: jest.fn() };

      await expect(
        controller.download('job-unknown', res as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when job is not completed', async () => {
      exportService.getJob.mockResolvedValue({
        id: 'job-123',
        status: 'processing',
        filePath: null,
        fileName: 'export.csv',
      } as any);

      const res = { download: jest.fn() };

      await expect(
        controller.download('job-123', res as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
