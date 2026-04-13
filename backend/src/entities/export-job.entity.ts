import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn,
} from 'typeorm';
import { ExportFormat } from '../enums';

@Entity('export_jobs')
export class ExportJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tableClass: string;

  @Column()
  exportName: string;

  @Column()
  fileName: string;

  @Column({ type: 'varchar' })
  format: ExportFormat;

  @Column({ type: 'jsonb' })
  queryState: Record<string, any>;

  @Column({ nullable: true, type: 'text' })
  selectedIds: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ nullable: true })
  filePath: string;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
