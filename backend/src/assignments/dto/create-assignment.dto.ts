import { IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

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
  teacherId: string; // If admin creates, they specify teacher. If teacher creates, we can use their ID.

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
}
