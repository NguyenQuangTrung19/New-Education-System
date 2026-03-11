import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonFeedbackDto } from './create-lesson-feedback.dto';

export class UpdateLessonFeedbackDto extends PartialType(CreateLessonFeedbackDto) {}
