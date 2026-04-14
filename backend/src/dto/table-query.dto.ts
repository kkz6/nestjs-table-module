import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class TableQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 15;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value, obj }) => {
    // If already an object (NestJS parsed nested params), use directly
    if (value && typeof value === 'object') return value;
    // If JSON string, parse it
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    // Fall back: manually extract filters from the raw query object
    // NestJS may pass filters[key][clause] as obj['filters[key][clause]']
    if (!value && obj) {
      const filters: Record<string, Record<string, string>> = {};
      for (const key of Object.keys(obj)) {
        const match = key.match(/^filters\[(\w+)]\[(\w+)]$/);
        if (match) {
          const [, filterKey, clause] = match;
          if (!filters[filterKey]) filters[filterKey] = {};
          filters[filterKey][clause] = obj[key];
        }
      }
      if (Object.keys(filters).length > 0) return filters;
    }
    return value;
  })
  filters?: Record<string, Record<string, string>>;

  @IsOptional()
  @IsString()
  columns?: string;
}
