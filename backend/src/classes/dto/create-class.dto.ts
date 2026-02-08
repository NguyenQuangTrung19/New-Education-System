import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  gradeLevel: number;

  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsOptional()
  academicYear?: string;

  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsInt()
  @IsOptional()
  studentCount?: number;

  @IsInt()
  @IsOptional()
  maleStudentCount?: number;

  @IsInt()
  @IsOptional()
  femaleStudentCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  averageGpa?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  currentWeeklyScore?: number;

  @IsArray()
  @IsOptional()
  weeklyScoreHistory?: Array<{ week: number; score: number }>;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  notes?: string[];
}
