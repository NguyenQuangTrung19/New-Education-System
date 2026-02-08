import { IsString, IsEmail, IsNotEmpty, IsOptional, 
  IsNumber, IsArray, IsDateString, IsInt, Min, Max, MinLength, IsEnum } from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string; // Optional, can generate default

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  classId?: string;

  @IsNumber()
  @IsOptional()
  enrollmentYear?: number;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  gpa?: number;

  @IsString()
  @IsOptional()
  address?: string;
  
  @IsString()
  @IsOptional()
  phone?: string;
  
  @IsString()
  @IsOptional()
  guardianName?: string;
  
  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsString()
  @IsOptional()
  guardianCitizenId?: string;

  @IsInt()
  @IsOptional()
  guardianYearOfBirth?: number;

  @IsString()
  @IsOptional()
  guardianJob?: string;

  @IsString()
  @IsOptional()
  semesterEvaluation?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  notes?: string[];
}

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  classId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  gpa?: number;

  @IsNumber()
  @IsOptional()
  enrollmentYear?: number;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;
  
  @IsString()
  @IsOptional()
  address?: string;
  
  @IsString()
  @IsOptional()
  phone?: string; // usually on User but simplified here

  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsString()
  @IsOptional()
  guardianCitizenId?: string;

  @IsInt()
  @IsOptional()
  guardianYearOfBirth?: number;

  @IsString()
  @IsOptional()
  guardianJob?: string;

  @IsString()
  @IsOptional()
  semesterEvaluation?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  notes?: string[];
}
