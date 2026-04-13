import { ExportFormat } from '../enums';

export interface ExportSerialized {
  name: string;
  label: string;
  fileName: string;
  format: ExportFormat;
}
