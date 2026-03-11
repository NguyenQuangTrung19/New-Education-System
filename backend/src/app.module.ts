import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassesModule } from './classes/classes.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SubjectsModule } from './subjects/subjects.module';
import { CommonModule } from './common/common.module';
import { ScheduleModule } from './schedule/schedule.module';

import { ImportsModule } from './imports/imports.module';
import { TimetableModule } from './timetable/timetable.module';
import { TeachingAssignmentsModule } from './teaching-assignments/teaching-assignments.module';
import { GradesModule } from './grades/grades.module';
import { LessonFeedbackModule } from './lesson-feedback/lesson-feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // max 100 requests per minute per IP
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    SubjectsModule,
    AssignmentsModule,
    CommonModule,
    ImportsModule,
    ScheduleModule,
    TimetableModule,
    TeachingAssignmentsModule,
    GradesModule,
    LessonFeedbackModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
