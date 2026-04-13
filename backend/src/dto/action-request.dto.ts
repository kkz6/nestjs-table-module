import { IsOptional, IsString, IsArray } from 'class-validator';

export class ActionRequestDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsArray()
  ids?: string[];
}
