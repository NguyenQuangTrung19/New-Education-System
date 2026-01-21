import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  create(createScheduleDto: CreateScheduleDto) {
    return this.prisma.scheduleItem.create({
      data: createScheduleDto
    });
  }

  findAll(query: any = {}) {
    // Basic filter support
    const where: any = {};
    if (query.classId) where.classId = query.classId;
    if (query.teacherId) where.teacherId = query.teacherId;

    return this.prisma.scheduleItem.findMany({
      where,
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: true } }
      },
      orderBy: { period: 'asc' }
    });
  }

  findOne(id: string) {
    return this.prisma.scheduleItem.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: true } }
      }
    });
  }

  update(id: string, updateScheduleDto: UpdateScheduleDto) {
    return this.prisma.scheduleItem.update({
        where: { id },
        data: updateScheduleDto
    });
  }

  remove(id: string) {
    return this.prisma.scheduleItem.delete({
      where: { id }
    });
  }
}
