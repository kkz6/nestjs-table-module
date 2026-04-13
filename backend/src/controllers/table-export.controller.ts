import {
  Controller, Post, Get, Param, Query, Res, Sse,
  UseGuards, NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { TableRegistry } from '../table-registry';
import { TableExportService } from '../services/table-export.service';
import { TableSseService } from '../services/table-sse.service';
import { TableQueryDto } from '../dto/table-query.dto';

@Controller('table')
@UseGuards(AuthGuard('jwt'))
export class TableExportController {
  constructor(
    private registry: TableRegistry,
    private exportService: TableExportService,
    private sseService: TableSseService,
  ) {}

  @Post('export/:tableClass/:exportName')
  async trigger(
    @Param('tableClass') tableClass: string,
    @Param('exportName') exportName: string,
    @Query() query: TableQueryDto,
  ) {
    const table = this.registry.get(tableClass);
    if (!table) throw new NotFoundException(`Table ${tableClass} not found`);

    // userId would come from request user in real app
    const job = await this.exportService.createJob(table, exportName, query, {}, 0);

    this.exportService.processExport(job.id).catch(() => {});

    return { jobId: job.id };
  }

  @Sse('export/stream/:jobId')
  stream(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return this.sseService.getStream(jobId);
  }

  @Get('export/download/:jobId')
  async download(
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ) {
    const job = await this.exportService.getJob(jobId);
    if (!job || job.status !== 'completed') {
      throw new NotFoundException('Export not ready');
    }
    return res.download(job.filePath, job.fileName);
  }
}
