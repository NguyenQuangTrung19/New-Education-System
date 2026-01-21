import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: createSubjectDto
    });
  }

  findAll() {
    return this.prisma.subject.findMany({
      include: {
        homeworks: true,
        // teachingAssignments: { include: { teacher: { include: { user: true } } } } // if needed
      }
    });
  }

  findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        homeworks: true,
        teachingAssignments: { include: { teacher: { include: { user: true } } } }
      }
    });
  }

  update(id: string, updateSubjectDto: UpdateSubjectDto) {
    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
    });
  }

  remove(id: string) {
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
