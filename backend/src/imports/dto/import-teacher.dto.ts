
import { IsNotEmpty, IsString, IsOptional, IsEmail, IsEnum, IsNumber, IsDateString, Matches, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../students/dto/create-student.dto';

export class ImportTeacherDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  full_name: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @Length(3, 20)
  username: string;

  @IsNotEmpty({ message: 'Start year is required' })
  @IsNumber()
  @Type(() => Number)
  start_year: number;

  @IsNotEmpty({ message: 'Date of birth is required' })
  dob: any; 

  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(Gender, { message: 'Gender must be Male, Female, or Other' })
  gender: Gender;

  @IsNotEmpty({ message: 'Citizen ID is required' })
  @IsString()
  @Length(12, 12)
  citizen_id: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty({ message: 'Subjects are required' })
  @IsString()
  subjects: string; // Comma separated
}
