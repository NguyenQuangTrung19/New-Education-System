import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  create(createSubjectDto: any) {
    const { notes, ...data } = createSubjectDto;
    return this.prisma.subject.create({
      data: data
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

  update(id: string, updateSubjectDto: any) {
    const { notes, ...data } = updateSubjectDto;
    return this.prisma.subject.update({
      where: { id },
      data: data,
    });
  }

  remove(id: string) {
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
