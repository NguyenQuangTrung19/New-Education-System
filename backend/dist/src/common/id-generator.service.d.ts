import { PrismaService } from '../prisma/prisma.service';
export declare class IdGeneratorService {
    private prisma;
    constructor(prisma: PrismaService);
    generateStudentId(tx?: any): Promise<string>;
    generateTeacherId(tx?: any): Promise<string>;
    generateClassId(year: string, tx?: any): Promise<string>;
    private generateId;
}
