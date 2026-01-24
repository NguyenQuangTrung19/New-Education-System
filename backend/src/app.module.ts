import { Module } from '@nestjs/common';
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
import { ScheduleModule } from './schedule/schedule.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, StudentsModule, TeachersModule, ClassesModule, AssignmentsModule, SubjectsModule, ScheduleModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
