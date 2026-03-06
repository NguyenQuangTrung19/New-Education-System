import { IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';

enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;

  @IsEnum(UserRole, { message: 'Role must be ADMIN, TEACHER, or STUDENT' })
  role: string;
}
