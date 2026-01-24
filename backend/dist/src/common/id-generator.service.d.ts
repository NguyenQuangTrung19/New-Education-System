import { PrismaService } from '../prisma/prisma.service';
export declare class IdGeneratorService {
    private prisma;
    constructor(prisma: PrismaService);
    generateStudentId(enrollmentYear: number): Promise<string>;
    generateTeacherId(joinYear: number): Promise<string>;
    generateClassId(year: string): Promise<string>;
    private generateId;
}
