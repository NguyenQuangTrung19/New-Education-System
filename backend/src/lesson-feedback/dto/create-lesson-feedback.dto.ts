import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateLessonFeedbackDto {
  @IsString()
  @IsNotEmpty()
  scheduleId: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsIn(['A', 'B', 'C', 'D', 'E', 'F'])
  rating: string;

  @IsString()
  comment: string;

  @IsString()
  signature: string;
}
