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
        user: { select: { name: true, email: true, avatarUrl: true } },
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
          username: teacherId, // Use Teacher ID as username
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
          // subjects logic would go here, simplified for now
          subjects: subjects || [],
        },
      });
      
      return { ...teacher, user };
    });
  }

  async update(id: string, updateTeacherDto: any) {
     const { name, email, ...teacherData } = updateTeacherDto;
     
     if (name || email) {
        await this.prisma.user.update({
          where: { id },
          data: { name, email }
        });
     }

     return this.prisma.teacher.update({
       where: { id },
       data: teacherData,
     });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (prisma) => {
        await prisma.teacher.delete({ where: { id } });
        return prisma.user.delete({ where: { id } }); // cascade?
    });
  }
}
