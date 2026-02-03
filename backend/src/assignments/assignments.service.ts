import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  create(createAssignmentDto: CreateAssignmentDto) {
    const { classIds, teacherId, subjectId, ...data } = createAssignmentDto;

    // Connect classes if provided
    const classesConnect = classIds?.map(id => ({ id })) || [];

    return this.prisma.assignment.create({
      data: {
        ...data,
        subject: { connect: { id: subjectId } },
        teacher: { connect: { id: teacherId } },
        classes: { connect: classesConnect },
        classIds: classIds || []
      }
    });
  }

  findAll() {
    return this.prisma.assignment.findMany({
      include: {
        subject: true,
        teacher: { include: { user: true } },
        classes: true,
        submissions: true
      }
    });
  }

  findOne(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        classes: true,
        submissions: { include: { student: { include: { user: true } } } }
      }
    });
  }

  update(id: string, updateAssignmentDto: UpdateAssignmentDto) {
    return this.prisma.assignment.update({
      where: { id },
      data: updateAssignmentDto,
    });
  }

  remove(id: string) {
    return this.prisma.assignment.delete({
      where: { id },
    });
  }

  async submit(assignmentId: string, submitDto: SubmitAssignmentDto) {
    const { studentId, answers } = submitDto;

    // Check if assignment exists
    const assignment = await this.prisma.assignment.findUnique({
        where: { id: assignmentId }
    });
    if (!assignment) {
        throw new Error('Assignment not found');
    }

    // Check if submission exists
    const existing = await this.prisma.assignmentSubmission.findFirst({
        where: {
            assignmentId,
            studentId
        }
    });

    if (existing) {
        return this.prisma.assignmentSubmission.update({
            where: { id: existing.id },
            data: {
                answers,
                submittedAt: new Date(),
                status: 'submitted'
            }
        });
    }

    return this.prisma.assignmentSubmission.create({
        data: {
            assignmentId,
            studentId,
            answers,
            status: 'submitted'
        }
    });
  }

  async grade(submissionId: string, gradeDto: GradeSubmissionDto) {
      return this.prisma.assignmentSubmission.update({
          where: { id: submissionId },
          data: {
              score: gradeDto.score,
              feedback: gradeDto.feedback,
              status: 'graded'
          }
      });
  }
}
