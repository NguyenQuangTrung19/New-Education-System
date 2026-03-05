import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async findAll(classId?: string, subjectId?: string, studentId?: string) {
    const where: any = {};
    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (studentId) {
      where.studentId = studentId;
    }
    if (classId) {
      where.student = { classId };
    }

    return this.prisma.studentGrade.findMany({
      where,
      include: {
        student: { select: { id: true, user: { select: { name: true } } } },
        subject: { select: { id: true, name: true } },
      },
    });
  }

  async bulkSave(grades: any[]) {
    if (!grades || !grades.length) {
      return { success: true, count: 0 };
    }

    return this.prisma.$transaction(async (tx) => {
      for (const grade of grades) {
        if (!grade.studentId || !grade.subjectId) {
          throw new BadRequestException('studentId and subjectId are required for all grades');
        }

        const existing = await tx.studentGrade.findFirst({
          where: {
            studentId: grade.studentId,
            subjectId: grade.subjectId,
            semester: grade.semester || 'HK1',
            academicYear: grade.academicYear || '2025-2026',
          },
        });

        const dataToSave = {
          studentId: grade.studentId,
          subjectId: grade.subjectId,
          semester: grade.semester || 'HK1',
          academicYear: grade.academicYear || '2025-2026',
          oralScore: grade.oralScore ?? null,
          fifteenMinScores: grade.fifteenMinScores || [],
          midTermScore: grade.midTermScore ?? null,
          finalScore: grade.finalScore ?? null,
          average: grade.average ?? null,
          feedback: grade.feedback ?? null,
        };

        if (existing) {
          await tx.studentGrade.update({
            where: { id: existing.id },
            data: dataToSave,
          });
        } else {
          await tx.studentGrade.create({
            data: dataToSave,
          });
        }
      }
      return { success: true, count: grades.length };
    });
  }
}
