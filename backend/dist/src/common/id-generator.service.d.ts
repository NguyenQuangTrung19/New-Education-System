import { PrismaService } from '../prisma/prisma.service';
export declare class IdGeneratorService {
    private prisma;
    constructor(prisma: PrismaService);
    generateStudentId(enrollmentYear: number, tx?: any): Promise<string>;
    generateTeacherId(joinYear: number, tx?: any): Promise<string>;
    generateClassId(year: string, tx?: any): Promise<string>;
    private generateId;
}
