import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class ImportClassDto {
  @IsNotEmpty({ message: 'Class name is required' })
  @IsString()
  class_name: string;

  @IsNotEmpty({ message: 'Classroom is required' })
  @IsString()
  classroom: string;

  @IsNotEmpty({ message: 'Academic year is required' })
  @Matches(/^\d{4}-\d{4}$/, { message: 'Academic year must be in format YYYY-YYYY' })
  academic_year: string;

  @IsOptional()
  @IsString()
  homeroom_teacher?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
