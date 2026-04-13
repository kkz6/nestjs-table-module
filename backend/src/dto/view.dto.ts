import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class StoreViewDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  requestPayload: Record<string, any>;
}
