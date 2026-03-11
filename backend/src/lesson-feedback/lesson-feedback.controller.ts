import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LessonFeedbackService } from './lesson-feedback.service';
import { CreateLessonFeedbackDto } from './dto/create-lesson-feedback.dto';
import { UpdateLessonFeedbackDto } from './dto/update-lesson-feedback.dto';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('lesson-feedback')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LessonFeedbackController {
  constructor(private readonly lessonFeedbackService: LessonFeedbackService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@Body() createLessonFeedbackDto: CreateLessonFeedbackDto) {
    return this.lessonFeedbackService.create(createLessonFeedbackDto);
  }

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT)
  findAll(@Query('teacherId') teacherId?: string, @Query('classId') classId?: string) {
    if (teacherId) {
       return this.lessonFeedbackService.findAllByTeacher(teacherId);
    }
    if (classId) {
       return this.lessonFeedbackService.findAllByClass(classId);
    }
    return [];
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT)
  findOne(@Param('id') id: string) {
    return this.lessonFeedbackService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateLessonFeedbackDto: UpdateLessonFeedbackDto) {
    return this.lessonFeedbackService.update(id, updateLessonFeedbackDto);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.lessonFeedbackService.remove(id);
  }
}
