import { IsString, IsEmail, IsNotEmpty, IsOptional, 
  IsNumber, IsArray, IsEnum, IsDateString, IsInt, MinLength } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateTeacherDto {
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
  password?: string;

  @IsArray()
  @IsOptional()
  subjects?: string[]; // Simplified for now, handling relations is complex

  @IsInt()
  @IsOptional()
  classesAssigned?: number;

  @IsNumber()
  @IsOptional()
  joinYear?: number;
  
  @IsString()
  @IsOptional()
  address?: string;
  
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  citizenId?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  notes?: string[];
}

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
  
  @IsArray()
  @IsOptional()
  subjects?: string[];

  @IsInt()
  @IsOptional()
  classesAssigned?: number;

  @IsNumber()
  @IsOptional()
  joinYear?: number;

  @IsString()
  @IsOptional()
  address?: string;
  
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  citizenId?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  notes?: string[];
}
