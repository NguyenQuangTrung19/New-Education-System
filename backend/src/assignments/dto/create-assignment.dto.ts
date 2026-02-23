import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { HomeworkStatus } from '@prisma/client';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsArray()
  @IsOptional()
  classIds?: string[];

  @IsDateString()
  dueDate: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  questions?: any;

  @IsEnum(HomeworkStatus)
  @IsOptional()
  status?: HomeworkStatus;
}
