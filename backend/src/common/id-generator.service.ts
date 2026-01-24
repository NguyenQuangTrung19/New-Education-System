import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generateStudentId(enrollmentYear: number): Promise<string> {
    return this.generateId('HS', enrollmentYear);
  }

  async generateTeacherId(joinYear: number): Promise<string> {
    return this.generateId('GV', joinYear);
  }

  async generateClassId(year: string): Promise<string> {
    // year format usually "2023-2024", we can use just the first part or the whole thing
    // Let's use 'C' + first 4 digits of year
    const yearPrefix = year.split('-')[0] || new Date().getFullYear().toString();
    return this.generateId('C', parseInt(yearPrefix));
  }

  private async generateId(prefix: string, year: number): Promise<string> {
    const key = `${prefix}_${year}`;
    
    // Atomic increment using Prisma
    const sequence = await (this.prisma as any).idSequence.upsert({
      where: { key },
      update: { value: { increment: 1 } },
      create: { key, value: 1 },
    });

    // Format: PREFIX + YEAR + SEQUENCE (3 digits)
    // e.g. HS2024-001
    const sequenceStr = sequence.value.toString().padStart(3, '0');
    return `${prefix}${year}-${sequenceStr}`;
  }
}
