import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
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
    const hashedPassword = password || 'student123'; // In real app, hash this!

    return this.prisma.$transaction(async (prisma) => {
      const enrollmentYear = studentData.enrollmentYear || new Date().getFullYear();
      const studentId = await this.idGenerator.generateStudentId(enrollmentYear);

      const user = await prisma.user.create({
        data: {
          username, 
          password: hashedPassword, 
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
          guardianName: studentData.guardianName,
          guardianPhone: studentData.guardianPhone,
        },
      });
      
      return { ...student, user };
    });
  }

  async update(id: string, updateStudentDto: any) {
    const { name, email, ...studentData } = updateStudentDto;

    // Update User info if provided
    if (name || email) {
      await this.prisma.user.update({
        where: { id },
        data: { 
          name: name,
          email: email
        }
      });
    }

    return this.prisma.student.update({
      where: { id },
      data: studentData,
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (prisma) => {
        // Delete student profile first (FK constraint usually)
        await prisma.student.delete({ where: { id } });
        // Delete user account
        return prisma.user.delete({ where: { id } });
    });
  }
}
