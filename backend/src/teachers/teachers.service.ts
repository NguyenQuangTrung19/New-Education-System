import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private passwordService: PasswordService,
  ) {}

  async findAll(params?: {
    page?: string;
    limit?: string;
    search?: string;
    subject?: string;
  }) {
    const page = params?.page ? parseInt(params.page, 10) : undefined;
    const limit = params?.limit ? parseInt(params.limit, 10) : undefined;
    const search = params?.search || '';
    const subject = params?.subject || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' as any } },
        { user: { name: { contains: search, mode: 'insensitive' as any } } },
        {
          user: { username: { contains: search, mode: 'insensitive' as any } },
        },
        { user: { email: { contains: search, mode: 'insensitive' as any } } },
        { subjects: { hasSome: [search] } },
      ];
    }

    if (subject) {
      where.subjects = { hasSome: [subject] };
    }

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const [total, teachers] = await this.prisma.$transaction([
        this.prisma.teacher.count({ where }),
        this.prisma.teacher.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                avatarUrl: true,
                username: true,
              },
            },
            classes: true,
          },
          orderBy: { id: 'asc' },
        }),
      ]);

      const data = teachers.map((teacher) => {
        const { user, ...rest } = teacher;
        return {
          ...rest,
          name: user.name,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl,
        };
      });

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } else {
      const teachers = await this.prisma.teacher.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              avatarUrl: true,
              username: true,
            },
          },
          classes: true,
        },
        orderBy: { id: 'asc' },
      });

      return teachers.map((teacher) => {
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
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true, username: true },
        },
        classes: true,
        teachingAssignments: { include: { subject: true, class: true } },
      },
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
    const { username, password, name, email, subjects, ...teacherData } =
      createTeacherDto;

    const plainPassword = password || 'teacher123';
    const hashedPassword =
      await this.passwordService.hashPassword(plainPassword);

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
          dateOfBirth: teacherData.dateOfBirth
            ? new Date(teacherData.dateOfBirth)
            : null,
          subjects: subjects || [],
          classesAssigned: teacherData.classesAssigned ?? 0,
          notes: teacherData.notes ?? [],
        },
      });

      return { ...teacher, user };
    });
  }

  async update(id: string, updateTeacherDto: any) {
    const {
      name,
      email,
      username,
      password,
      user,
      id: _id,
      ...teacherData
    } = updateTeacherDto;

    if (name || email) {
      const teacher = await this.prisma.teacher.findUnique({ where: { id } });
      if (teacher && teacher.userId) {
        await this.prisma.user.update({
          where: { id: teacher.userId },
          data: { name, email },
        });
      }
    }

    const normalizedTeacherData = {
      ...teacherData,
      dateOfBirth: teacherData.dateOfBirth
        ? new Date(teacherData.dateOfBirth)
        : undefined,
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
      await prisma.classGroup.updateMany({
        where: { teacherId: id },
        data: { teacherId: null },
      });

      await prisma.scheduleItem.updateMany({
        where: { teacherId: id },
        data: { teacherId: null },
      });

      await prisma.teachingAssignment.deleteMany({
        where: { teacherId: id },
      });

      await prisma.assignment.deleteMany({
        where: { teacherId: id },
      });

      await prisma.teacher.delete({ where: { id } });

      return prisma.user.delete({ where: { id: teacher.userId } });
    });
  }
}
