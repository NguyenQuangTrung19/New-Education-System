import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonFeedbackDto } from './dto/create-lesson-feedback.dto';
import { UpdateLessonFeedbackDto } from './dto/update-lesson-feedback.dto';

@Injectable()
export class LessonFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLessonFeedbackDto: CreateLessonFeedbackDto) {
    return this.prisma.lessonFeedback.create({
      data: createLessonFeedbackDto,
    });
  }

  async findAllByTeacher(teacherId: string) {
    return this.prisma.lessonFeedback.findMany({
      where: {
        schedule: {
          teacherId: teacherId,
        },
      },
      include: {
        schedule: true,
      },
    });
  }
  
  async findAllByClass(classId: string) {
    return this.prisma.lessonFeedback.findMany({
      where: {
        schedule: {
          classId: classId,
        },
      },
      include: {
        schedule: true,
      },
    });
  }

  async findOne(id: string) {
    const feedback = await this.prisma.lessonFeedback.findUnique({
      where: { id },
    });
    if (!feedback) {
      throw new NotFoundException(`LessonFeedback with ID ${id} not found`);
    }
    return feedback;
  }

  async update(id: string, updateLessonFeedbackDto: UpdateLessonFeedbackDto) {
    await this.findOne(id);
    return this.prisma.lessonFeedback.update({
      where: { id },
      data: updateLessonFeedbackDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lessonFeedback.delete({
      where: { id },
    });
  }
}
