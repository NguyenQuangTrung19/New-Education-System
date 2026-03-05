import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
// Force IDE cache refresh
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT)
  @Get()
  findAll(
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.gradesService.findAll(classId, subjectId, studentId);
  }

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post('bulk')
  bulkSave(@Body() payload: any[]) {
    return this.gradesService.bulkSave(payload);
  }
}
