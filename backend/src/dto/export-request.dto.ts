import { IsOptional, IsArray, IsString } from 'class-validator';

export class ExportRequestDto {
  @IsOptional()
  @IsArray()
  selectedIds?: string[];

  @IsOptional()
  @IsString()
  columns?: string;
}
