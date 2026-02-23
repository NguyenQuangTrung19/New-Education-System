import { Module } from '@nestjs/common';
import { TeachingAssignmentsController } from './teaching-assignments.controller';
import { TeachingAssignmentsService } from './teaching-assignments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeachingAssignmentsController],
  providers: [TeachingAssignmentsService]
})
export class TeachingAssignmentsModule {}
