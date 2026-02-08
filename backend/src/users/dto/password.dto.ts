import { IsString, MinLength } from 'class-validator';

export class AdminUpdatePasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}

export class ChangeOwnPasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
