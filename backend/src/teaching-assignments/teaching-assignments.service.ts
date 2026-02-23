import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachingAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.teachingAssignment.findMany({
      include: {
        teacher: { 
          include: { user: { select: { name: true } } }
        },
        class: { select: { name: true } },
        subject: { select: { name: true, code: true } }
      }
    });
  }

  async bulkSave(assignments: any[]) {
    // Basic pre-validation
    const teacherLoads: Record<string, number> = {};
    const classLoads: Record<string, number> = {};

    for (const a of assignments) {
      if (!a.teacherId || !a.classId || !a.subjectId) {
        throw new BadRequestException('Missing required fields in assignment payload.');
      }
      
      const sessions = Number(a.sessionsPerWeek) || 1;
      teacherLoads[a.teacherId] = (teacherLoads[a.teacherId] || 0) + sessions;
      classLoads[a.classId] = (classLoads[a.classId] || 0) + sessions;
    }

    // Constraint 1: Teacher Max Periods (40)
    for (const [tId, load] of Object.entries(teacherLoads)) {
      if (load > 40) {
        throw new BadRequestException(`Teacher ${tId} is overloaded with ${load} periods (Max: 40).`);
      }
    }

    // Constraint 2: Class Max Periods (40)
    for (const [cId, load] of Object.entries(classLoads)) {
      if (load > 40) {
        throw new BadRequestException(`Class ${cId} is overloaded with ${load} periods (Max: 40).`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
       // 1. Delete all existing
       await tx.teachingAssignment.deleteMany({});

       // 2. Insert new configurations
       const toInsert = assignments.map(a => ({
         teacherId: a.teacherId,
         subjectId: a.subjectId,
         classId: a.classId,
         sessionsPerWeek: Number(a.sessionsPerWeek) || 1
       }));

       if (toInsert.length > 0) {
           await tx.teachingAssignment.createMany({ data: toInsert });
       }
       
       return { success: true, count: toInsert.length };
    });
  }
}
