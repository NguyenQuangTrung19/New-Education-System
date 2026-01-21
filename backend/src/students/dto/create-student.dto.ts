import { IsString, IsEmail, IsNotEmpty, IsOptional, 
  IsNumber, Min, IsUUID } from 'class-validator';

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
  password?: string; // Optional, can generate default

  @IsString()
  @IsOptional()
  classId?: string;

  @IsNumber()
  @IsOptional()
  enrollmentYear?: number;

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
}

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  classId?: string;

  @IsNumber()
  @IsOptional()
  gpa?: number;
  
  @IsString()
  @IsOptional()
  address?: string;
  
  @IsString()
  @IsOptional()
  phone?: string; // usually on User but simplified here
}
