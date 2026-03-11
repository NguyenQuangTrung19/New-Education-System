import { Module } from '@nestjs/common';
import { LessonFeedbackService } from './lesson-feedback.service';
import { LessonFeedbackController } from './lesson-feedback.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LessonFeedbackController],
  providers: [LessonFeedbackService],
  exports: [LessonFeedbackService],
})
export class LessonFeedbackModule {}
