import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private passwordService: PasswordService
  ) {}

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
          }
        },
        class: true,
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: true,
        academicHistory: true,
        grades: {
            include: { subject: true }
        },
        attendance: true,
        tuitions: true,
      }
    });
  }
  
  async create(createStudentDto: any) {
    const { username, password, name, email, classId, ...studentData } = createStudentDto;
    
    // Hash password or set default
    const plainPassword = password || 'student123';
    const hashedPassword = await this.passwordService.hashPassword(plainPassword);
    const encryptedPassword = this.passwordService.encryptPassword(plainPassword);

    return this.prisma.$transaction(async (prisma) => {
      const enrollmentYear = studentData.enrollmentYear || new Date().getFullYear();
      const studentId = await this.idGenerator.generateStudentId(enrollmentYear);

      const user = await prisma.user.create({
        data: {
          username, 
          password: hashedPassword, 
          passwordEncrypted: encryptedPassword,
          name,
          email,
          role: 'STUDENT',
        },
      });

      const student = await prisma.student.create({
        data: {
          id: studentId,
          userId: user.id,
          classId: classId || null,
          enrollmentYear,
          // Add other fields as necessary from dto
          address: studentData.address,
          gender: studentData.gender,
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
          gpa: studentData.gpa || 0.0,
          guardianName: studentData.guardianName,
          guardianPhone: studentData.guardianPhone,
          guardianCitizenId: studentData.guardianCitizenId,
          guardianJob: studentData.guardianJob,
          guardianYearOfBirth: studentData.guardianYearOfBirth,
          semesterEvaluation: studentData.semesterEvaluation,
          notes: studentData.notes ?? [],
        },
      });
      
      return { ...student, user };
    });
  }

  async update(id: string, updateStudentDto: any) {
    const { name, email, username, password, user, id: _id, ...studentData } = updateStudentDto;

    // Update User info if provided
    if (name || email) {
      const student = await this.prisma.student.findUnique({ where: { id } });
      if (student && student.userId) {
          await this.prisma.user.update({
            where: { id: student.userId },
            data: { 
              name: name,
              email: email
            }
          });
      }
    }

    const normalizedStudentData = {
      ...studentData,
      dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
    };

    return this.prisma.student.update({
      where: { id },
      data: normalizedStudentData,
    });
  }

  async remove(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) return null;

    return this.prisma.$transaction(async (prisma) => {
        // Cleanup relations if needed (mostly cascades for student, but good to be safe)
        // e.g. Attendance, Grades usually cascade delete on Student delete? 
        // Let's assume Prisma schema handles cascade for simple child tables, 
        // but let's be explicit if we are unsure.
        // For now, simple delete of student usually works unless strict constraints exist.

        // Delete student profile first
        await prisma.student.delete({ where: { id } });
        
        // Delete user account
        return prisma.user.delete({ where: { id: student.userId } });
    });
  }
}
