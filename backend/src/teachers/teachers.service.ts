import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: { select: { name: true, email: true, avatarUrl: true, username: true } },
        classes: true,
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        classes: true,
        teachingAssignments: { include: { subject: true, class: true } },
        
      }
    });
  }
  async create(createTeacherDto: any) {
    const { username, password, name, email, subjects, ...teacherData } = createTeacherDto;
    
    const hashedPassword = password || 'teacher123';

    return this.prisma.$transaction(async (prisma) => {
      const joinYear = teacherData.joinYear || new Date().getFullYear();
      const teacherId = await this.idGenerator.generateTeacherId(joinYear);

      const user = await prisma.user.create({
        data: {
          username, 
          password: hashedPassword,
          name,
          email,
          role: 'TEACHER',
        },
      });

      const teacher = await prisma.teacher.create({
        data: {
          id: teacherId,
          userId: user.id,
          joinYear,
          address: teacherData.address,
          phone: teacherData.phone,
          citizenId: teacherData.citizenId,
          gender: teacherData.gender || 'Male',
          dateOfBirth: teacherData.dateOfBirth ? new Date(teacherData.dateOfBirth) : null,
          // subjects logic would go here, simplified for now
          subjects: subjects || [],
        },
      });
      
      return { ...teacher, user };
    });
  }

  async update(id: string, updateTeacherDto: any) {
     // Destructure to separate User fields, Teacher fields, and fields to IGNORE (username, password, id, notes)
     // notes is sent by frontend but not in Teacher schema
     const { name, email, username, password, user, id: _id, notes, ...teacherData } = updateTeacherDto;
     
     if (name || email) {
        const teacher = await this.prisma.teacher.findUnique({ where: { id } });
        if (teacher && teacher.userId) {
            await this.prisma.user.update({
                where: { id: teacher.userId },
                data: { name, email }
            });
        }
     }

     return this.prisma.teacher.update({
       where: { id },
       data: teacherData,
     });
  }

  async remove(id: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) return null;

    return this.prisma.$transaction(async (prisma) => {
        // 1. Remove/Unlink related records to avoid FK violations
        
        // Unassign from Classes
        await prisma.classGroup.updateMany({
            where: { teacherId: id },
            data: { teacherId: null }
        });

        // Unassign from Schedule Items
        await prisma.scheduleItem.updateMany({
            where: { teacherId: id },
            data: { teacherId: null }
        });

        // Delete Teaching Assignments
        await prisma.teachingAssignment.deleteMany({
            where: { teacherId: id }
        });

        // Assignments posted by teacher: 
        // We cannot set teacherId to null as it is required. 
        // For now, we will DELETE them (cascade) or we assume user accepts this data loss.
        // Alternative: Reassign to a placeholder. Let's delete for now as it makes sense if teacher creates content.
        await prisma.assignment.deleteMany({
            where: { teacherId: id }
        });

        // 2. Delete Teacher Profile
        await prisma.teacher.delete({ where: { id } });

        // 3. Delete User Account
        return prisma.user.delete({ where: { id: teacher.userId } });
    });
  }
}
