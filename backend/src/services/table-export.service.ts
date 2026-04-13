import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ExportJobEntity } from '../entities/export-job.entity';
import { TableSseService } from './table-sse.service';
import { TableRegistry } from '../table-registry';
import { ExportFormat } from '../enums';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TableExportService {
  constructor(
    @InjectRepository(ExportJobEntity)
    private jobRepo: Repository<ExportJobEntity>,
    private sseService: TableSseService,
    private registry: TableRegistry,
    private dataSource: DataSource,
  ) {}

  async createJob(table: any, exportName: string, query: any, body: any, userId: number) {
    const exportDef = table.getExports().find((e: any) => e.getName() === exportName);
    if (!exportDef) throw new Error(`Export ${exportName} not found`);

    const job = this.jobRepo.create({
      tableClass: table.getRegistryName(),
      exportName,
      fileName: exportDef.getFileName(),
      format: exportDef.getFormat(),
      queryState: query ?? {},
      selectedIds: body?.selectedIds?.join(',') ?? null,
      status: 'pending',
      userId,
    });

    return this.jobRepo.save(job);
  }

  async getJob(jobId: string) {
    return this.jobRepo.findOneBy({ id: jobId });
  }

  async processExport(jobId: string) {
    const job = await this.jobRepo.findOneBy({ id: jobId });
    if (!job) return;

    try {
      job.status = 'processing';
      await this.jobRepo.save(job);
      this.sseService.emit({ jobId, status: 'processing', progress: 0 });

      const table = this.registry.get(job.tableClass);
      if (!table) throw new Error('Table not found');

      const config = table.getConfig();
      const repo = this.dataSource.getRepository(config.resource);
      const qb = repo.createQueryBuilder('entity');

      // TODO: Apply filters from queryState (reuse TableQueryService logic)
      const data = await qb.getMany();

      this.sseService.emit({ jobId, status: 'processing', progress: 50 });

      const exportDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
      const filePath = path.join(exportDir, `${jobId}-${job.fileName}`);

      if (job.format === ExportFormat.Xlsx || job.format === ExportFormat.Csv) {
        await this.generateSpreadsheet(table, data, filePath, job.format);
      } else if (job.format === ExportFormat.Pdf) {
        await this.generatePdf(table, data, filePath);
      }

      job.status = 'completed';
      job.progress = 100;
      job.filePath = filePath;
      await this.jobRepo.save(job);

      this.sseService.emit({
        jobId,
        status: 'completed',
        progress: 100,
        downloadUrl: `/table/export/download/${jobId}`,
      });
    } catch (error: any) {
      job.status = 'failed';
      await this.jobRepo.save(job);
      this.sseService.emit({
        jobId,
        status: 'failed',
        progress: 0,
        error: error.message,
      });
    }
  }

  private async generateSpreadsheet(table: any, data: any[], filePath: string, format: ExportFormat) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data');

    const columns = table.getColumns().filter((c: any) => c.shouldBeExported());
    sheet.columns = columns.map((col: any) => ({
      header: col.getHeader(),
      key: col.getAttribute(),
      width: 20,
    }));

    for (const item of data) {
      const row: Record<string, any> = {};
      for (const col of columns) {
        row[col.getAttribute()] = col.mapForExport(col.getDataFromItem(item), item);
      }
      sheet.addRow(row);
    }

    if (format === ExportFormat.Csv) {
      await workbook.csv.writeFile(filePath);
    } else {
      await workbook.xlsx.writeFile(filePath);
    }
  }

  private async generatePdf(table: any, data: any[], filePath: string) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const columns = table.getColumns().filter((c: any) => c.shouldBeExported());

    doc.fontSize(10).font('Helvetica-Bold');
    let x = 30;
    for (const col of columns) {
      doc.text(col.getHeader(), x, 30, { width: 100 });
      x += 110;
    }

    doc.font('Helvetica').fontSize(9);
    let y = 50;
    for (const item of data) {
      x = 30;
      for (const col of columns) {
        const value = col.mapForExport(col.getDataFromItem(item), item);
        doc.text(String(value ?? ''), x, y, { width: 100 });
        x += 110;
      }
      y += 15;
      if (y > 550) {
        doc.addPage();
        y = 30;
      }
    }

    doc.end();
    await new Promise<void>((resolve) => stream.on('finish', resolve));
  }
}
