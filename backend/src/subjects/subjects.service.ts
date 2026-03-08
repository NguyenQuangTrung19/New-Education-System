import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  public static readonly DEPARTMENTS = [
    'Tổ Toán - Tin',
    'Tổ Ngữ Văn',
    'Tổ Khoa học Tự nhiên',
    'Tổ Khoa học Xã hội',
    'Tổ Ngoại ngữ',
    'Tổ Năng khiếu / Nghệ thuật',
    'Tổ Công nghệ',
    'Tổ Tổng hợp / Văn phòng',
  ];

  getDepartments() {
    return SubjectsService.DEPARTMENTS;
  }

  create(createSubjectDto: any) {
    const { name, code, department, description } = createSubjectDto;
    return this.prisma.subject.create({
      data: {
        name,
        code,
        department,
        description,
      },
    });
  }

  findAll() {
    return this.prisma.subject.findMany({
      include: {
        homeworks: true,
        // teachingAssignments: { include: { teacher: { include: { user: true } } } } // if needed
      },
    });
  }

  findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        homeworks: true,
        teachingAssignments: {
          include: { teacher: { include: { user: true } } },
        },
      },
    });
  }

  update(id: string, updateSubjectDto: any) {
    const { name, code, department, description } = updateSubjectDto;
    return this.prisma.subject.update({
      where: { id },
      data: {
        name,
        code,
        department,
        description,
      },
    });
  }

  remove(id: string) {
    return this.prisma.$transaction(async (prisma) => {
      const assignments = await prisma.assignment.findMany({ where: { subjectId: id } });
      const assignmentIds = assignments.map(a => a.id);
      
      if (assignmentIds.length > 0) {
        await prisma.assignmentSubmission.deleteMany({ where: { assignmentId: { in: assignmentIds } } });
      }

      await prisma.assignment.deleteMany({ where: { subjectId: id } });
      await prisma.studentGrade.deleteMany({ where: { subjectId: id } });
      await prisma.teachingAssignment.deleteMany({ where: { subjectId: id } });
      await prisma.scheduleItem.deleteMany({ where: { subjectId: id } });
      
      return prisma.subject.delete({ where: { id } });
    });
  }
}
