import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';

@Injectable()
export class ClassesService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

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

  async create(createClassDto: any) {
      const { academicYear, ...classData } = createClassDto;
      const year = academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      
      const classId = await this.idGenerator.generateClassId(year);

      return this.prisma.classGroup.create({
          data: {
              id: classId,
              academicYear: year,
              ...classData
          }
      });
  }

  async update(id: string, updateClassDto: any) {
      return this.prisma.classGroup.update({
          where: { id },
          data: updateClassDto
      });
  }

  async remove(id: string) {
      return this.prisma.classGroup.delete({
          where: { id }
      });
  }
}
