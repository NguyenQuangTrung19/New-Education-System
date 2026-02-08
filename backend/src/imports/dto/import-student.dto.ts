
import { IsNotEmpty, IsString, IsOptional, IsEmail, IsEnum, IsNumber, IsDateString, Matches, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../students/dto/create-student.dto';

export class ImportStudentDto {
  @IsOptional()
  @IsString()
  student_code?: string;

  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  full_name: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @Length(3, 20)
  username: string;

  @IsNotEmpty({ message: 'Date of birth is required' })
  // We validate as string first, service will parse
  dob: any; 

  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(Gender, { message: 'Gender must be Male, Female, or Other' })
  gender: Gender;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty({ message: 'Class name is required' })
  @IsString()
  class_name: string;

  @IsNotEmpty({ message: 'Guardian name is required' })
  @IsString()
  guardian_name: string;

  @IsNotEmpty({ message: 'Guardian phone is required' })
  @IsString()
  @Matches(/^0[0-9]{9}$/, { message: 'Phone must start with 0 and have 10 digits' })
  guardian_phone: string;

  @IsOptional()
  @IsNumber({}, { message: 'Guardian birth year must be a number' })
  @Type(() => Number)
  guardian_birth_year?: number;

  @IsOptional()
  @IsString()
  guardian_occupation?: string;

  @IsNotEmpty({ message: 'Guardian Citizen ID is required' })
  @IsString()
  @Length(12, 12, { message: 'Citizen ID must be 12 digits' })
  guardian_citizen_id: string;
}
