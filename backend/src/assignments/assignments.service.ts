import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { HomeworkStatus } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto) {
    const { classIds = [], teacherId, subjectId, status, ...data } = dto;

    // Duplicate guard: same title + subject + teacher combination
    const existing = await this.prisma.assignment.findFirst({
      where: { title: dto.title, subjectId, teacherId },
    });
    if (existing) {
      throw new ConflictException(
        `An assignment titled "${dto.title}" for this subject and teacher already exists.`,
      );
    }

    return this.prisma.assignment.create({
      data: {
        ...data,
        subject: { connect: { id: subjectId } },
        teacher: { connect: { id: teacherId } },
        classes: { connect: classIds.map((id) => ({ id })) },
        classIds,
        status: (status as HomeworkStatus) ?? HomeworkStatus.ACTIVE,
      },
      include: { subject: true, teacher: { include: { user: true } }, classes: true },
    });
  }

  async findAll(teacherId?: string, classId?: string) {
    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (classId) where.classes = { some: { id: classId } };

    return this.prisma.assignment.findMany({
      where,
      include: {
        subject: true,
        teacher: { include: { user: true } },
        classes: true,
        submissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        classes: true,
        submissions: { include: { student: { include: { user: true } } } },
      },
    });
    if (!assignment) throw new NotFoundException(`Assignment ${id} not found.`);
    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    await this.findOne(id); // Throws 404 if missing

    const { classIds, teacherId, subjectId, status, ...rest } = dto;

    return this.prisma.assignment.update({
      where: { id },
      data: {
        ...rest,
        ...(status && { status: status as HomeworkStatus }),
        ...(subjectId && { subject: { connect: { id: subjectId } } }),
        ...(teacherId && { teacher: { connect: { id: teacherId } } }),
        // Re-link classes properly: clear old, set new
        ...(classIds !== undefined && {
          classes: { set: classIds.map((cid) => ({ id: cid })) },
          classIds,
        }),
      },
      include: { subject: true, teacher: { include: { user: true } }, classes: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Throws 404 if missing
    return this.prisma.$transaction(async (tx) => {
      // 1. Remove all submissions first (FK safety)
      await tx.assignmentSubmission.deleteMany({ where: { assignmentId: id } });
      // 2. Remove the assignment itself
      return tx.assignment.delete({ where: { id } });
    });
  }

  async submit(assignmentId: string, submitDto: SubmitAssignmentDto) {
    const { studentId, answers } = submitDto;

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found.');

    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { assignmentId, studentId },
    });

    if (existing) {
      return this.prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: { answers, submittedAt: new Date(), status: 'submitted' },
      });
    }

    return this.prisma.assignmentSubmission.create({
      data: { assignmentId, studentId, answers, status: 'submitted' },
    });
  }

  async grade(submissionId: string, gradeDto: GradeSubmissionDto) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission not found.');

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { score: gradeDto.score, feedback: gradeDto.feedback, status: 'graded' },
    });
  }
}
