import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
  ) {}

  async findAll(params?: {
    page?: string;
    limit?: string;
    search?: string;
    grade?: string;
    academicYear?: string;
  }) {
    const page = params?.page ? parseInt(params.page, 10) : undefined;
    const limit = params?.limit ? parseInt(params.limit, 10) : undefined;
    const search = params?.search || '';
    const gradeLevel = params?.grade ? parseInt(params.grade, 10) : undefined;
    const academicYear = params?.academicYear || undefined;

    const where: any = {};

    if (academicYear) {
      where.academicYear = academicYear;
    }

    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as any } },
        { room: { contains: search, mode: 'insensitive' as any } },
        {
          teacher: {
            user: { name: { contains: search, mode: 'insensitive' as any } },
          },
        },
      ];
    }

    const includeConfig = {
      teacher: {
        include: { user: { select: { name: true } } },
      },
      _count: {
        select: { students: true },
      },
    };

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const [total, classes] = await this.prisma.$transaction([
        this.prisma.classGroup.count({ where }),
        this.prisma.classGroup.findMany({
          where,
          skip,
          take: limit,
          include: includeConfig,
          orderBy: { name: 'asc' },
        }),
      ]);

      return {
        data: classes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } else {
      return this.prisma.classGroup.findMany({
        where,
        include: includeConfig,
        orderBy: { name: 'asc' },
      });
    }
  }

  async findOne(id: string) {
    return this.prisma.classGroup.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: true } },
        students: { include: { user: true } },
        scheduleItems: {
          include: { subject: true, teacher: { include: { user: true } } },
        },
        teachingAssignments: {
          include: { subject: true, teacher: { include: { user: true } } },
        },
      },
    });
  }

  async create(createClassDto: CreateClassDto) {
    // Ignore frontend ID and normalize academic year.
    const { academicYear, ...validClassData } = createClassDto;

    const year =
      academicYear ||
      `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    const classId = await this.idGenerator.generateClassId(year);

    return this.prisma.classGroup.create({
      data: {
        id: classId,
        academicYear: year,
        name: validClassData.name,
        gradeLevel: validClassData.gradeLevel,
        room: validClassData.room,
        teacherId: validClassData.teacherId || null,
        description: validClassData.description,
        averageGpa: validClassData.averageGpa ?? 0,
        currentWeeklyScore: validClassData.currentWeeklyScore ?? 100,
        studentCount: validClassData.studentCount ?? 0,
        maleStudentCount: validClassData.maleStudentCount ?? 0,
        femaleStudentCount: validClassData.femaleStudentCount ?? 0,
        weeklyScoreHistory: validClassData.weeklyScoreHistory ?? [],
        notes: validClassData.notes ?? [],
      },
    });
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    // updated
    const { ...validUpdateData } = updateClassDto;

    const normalizedUpdateData: any = { ...validUpdateData };
    if (Object.prototype.hasOwnProperty.call(validUpdateData, 'teacherId')) {
      normalizedUpdateData.teacherId = validUpdateData.teacherId || null;
    }
    if (
      Object.prototype.hasOwnProperty.call(
        validUpdateData,
        'weeklyScoreHistory',
      )
    ) {
      normalizedUpdateData.weeklyScoreHistory =
        validUpdateData.weeklyScoreHistory ?? [];
    }
    if (Object.prototype.hasOwnProperty.call(validUpdateData, 'notes')) {
      normalizedUpdateData.notes = validUpdateData.notes ?? [];
    }

    return this.prisma.classGroup.update({
      where: { id },
      data: normalizedUpdateData,
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Unassign students (optional relation)
      await prisma.student.updateMany({
        where: { classId: id },
        data: { classId: null },
      });

      // 2. Delete Schedule Items (required relation)
      await prisma.scheduleItem.deleteMany({
        where: { classId: id },
      });

      // 3. Delete Teaching Assignments (required relation)
      await prisma.teachingAssignment.deleteMany({
        where: { classId: id },
      });

      // 4. Assignments (Implicit M:N)
      // Prisma handles the join table deletion automatically.

      return prisma.classGroup.delete({
        where: { id },
      });
    });
  }
}
