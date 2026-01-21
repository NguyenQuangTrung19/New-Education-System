import { IsString, IsEmail, IsNotEmpty, IsOptional, 
  IsNumber, IsArray } from 'class-validator';

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
  password?: string;

  @IsArray()
  @IsOptional()
  subjects?: string[]; // Simplified for now, handling relations is complex

  @IsNumber()
  @IsOptional()
  joinYear?: number;
  
  @IsString()
  @IsOptional()
  address?: string;
  
  @IsString()
  @IsOptional()
  phone?: string;
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

  @IsString()
  @IsOptional()
  address?: string;
  
  @IsString()
  @IsOptional()
  phone?: string;
}
