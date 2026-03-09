import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generateStudentId(tx?: any): Promise<string> {
    return this.generateId('HS', tx);
  }

  async generateTeacherId(tx?: any): Promise<string> {
    return this.generateId('GV', tx);
  }

  async generateClassId(year: string, tx?: any): Promise<string> {
    // Let's use 'C' + first 4 digits of year
    const yearPrefix =
      year.split('-')[0] || new Date().getFullYear().toString();
    return this.generateId(`C${yearPrefix}`, tx, 3);
  }

  private async generateId(prefix: string, tx?: any, padding: number = 4): Promise<string> {
    const key = prefix;
    const client = tx || this.prisma;

    // Atomic increment using Prisma
    let sequence = await client.idSequence.upsert({
      where: { key },
      update: { value: { increment: 1 } },
      create: { key, value: 1 },
    });

    // Sync with existing database records on the first run
    if (sequence.value === 1) {
      let maxVal = 0;
      if (prefix === 'GV') {
        const existing = await client.teacher.findMany({
          where: { id: { startsWith: 'GV' } },
          select: { id: true }
        });
        const numbers = existing.map((e: { id: string }) => parseInt(e.id.replace('GV', '')) || 0);
        if (numbers.length > 0) maxVal = Math.max(...numbers);
      } else if (prefix === 'HS') {
        const existing = await client.student.findMany({
          where: { id: { startsWith: 'HS' } },
          select: { id: true }
        });
        const numbers = existing.map((e: { id: string }) => parseInt(e.id.replace('HS', '')) || 0);
        if (numbers.length > 0) maxVal = Math.max(...numbers);
      }

      if (maxVal >= 1) {
        sequence = await client.idSequence.update({
          where: { key },
          data: { value: maxVal + 1 },
        });
      }
    }

    // Format: PREFIX + SEQUENCE
    const sequenceStr = sequence.value.toString().padStart(padding, '0');
    return `${prefix}${sequenceStr}`;
  }
}
