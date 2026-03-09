import { IsArray, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportBatchDto {
  @IsArray()
  @IsNotEmpty({ message: 'Data array must not be empty' })
  data: any[];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  batchIndex: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  totalBatches: number;
}
