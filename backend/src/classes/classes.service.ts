import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.classGroup.findMany({
      include: {
        teacher: {
             include: { user: { select: { name: true } } }
        },
        _count: {
            select: { students: true }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.classGroup.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: true } },
        students: { include: { user: true } },
        scheduleItems: {
            include: { subject: true, teacher: { include: { user: true } } }
        },
        teachingAssignments: {
            include: { subject: true, teacher: { include: { user: true } } }
        }
      }
    });
  }
}
