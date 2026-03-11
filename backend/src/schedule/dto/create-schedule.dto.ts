import { IsInt, IsNotEmpty, IsOptional, IsString, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsInt()
  @Min(1)
  period: number;

  @IsString()
  @IsNotEmpty()
  session: string; // Morning, Afternoon

  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  weekStartDate?: Date;
}
