import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private passwordService: PasswordService
  ) {}

  async findAll() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        user: { select: { name: true, email: true, avatarUrl: true, username: true } },
        classes: true,
      }
    });

    return teachers.map(teacher => {
      const { user, ...rest } = teacher;
      return {
        ...rest,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      };
    });
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true, username: true } },
        classes: true,
        teachingAssignments: { include: { subject: true, class: true } },
      }
    });

    if (!teacher) return null;

    const { user, ...rest } = teacher;
    return {
      ...rest,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  }
  async create(createTeacherDto: any) {
    const { username, password, name, email, subjects, ...teacherData } = createTeacherDto;
    
    const plainPassword = password || 'teacher123';
    const hashedPassword = await this.passwordService.hashPassword(plainPassword);
    const encryptedPassword = this.passwordService.encryptPassword(plainPassword);

    return this.prisma.$transaction(async (prisma) => {
      const joinYear = teacherData.joinYear || new Date().getFullYear();
      const teacherId = await this.idGenerator.generateTeacherId(joinYear);

      const user = await prisma.user.create({
        data: {
          username, 
          password: hashedPassword,
          passwordEncrypted: encryptedPassword,
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
          classesAssigned: teacherData.classesAssigned ?? 0,
          notes: teacherData.notes ?? [],
        },
      });
      
      return { ...teacher, user };
    });
  }

  async update(id: string, updateTeacherDto: any) {
     // Destructure to separate User fields, Teacher fields, and fields to IGNORE (username, password, id)
     const { name, email, username, password, user, id: _id, ...teacherData } = updateTeacherDto;
     
     if (name || email) {
        const teacher = await this.prisma.teacher.findUnique({ where: { id } });
        if (teacher && teacher.userId) {
            await this.prisma.user.update({
                where: { id: teacher.userId },
                data: { name, email }
            });
        }
     }

     const normalizedTeacherData = {
       ...teacherData,
       dateOfBirth: teacherData.dateOfBirth ? new Date(teacherData.dateOfBirth) : undefined,
     };

     return this.prisma.teacher.update({
       where: { id },
       data: normalizedTeacherData,
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
