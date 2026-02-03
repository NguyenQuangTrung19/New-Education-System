
import { IsNotEmpty, IsString, IsOptional, IsJSON, IsObject } from 'class-validator';

export class SubmitAssignmentDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsObject()
  answers: any;
}
