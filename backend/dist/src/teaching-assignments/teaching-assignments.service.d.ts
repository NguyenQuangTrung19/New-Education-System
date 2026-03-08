import { PrismaService } from '../prisma/prisma.service';
export declare class TeachingAssignmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        teacher: {
            user: {
                name: string;
            };
        } & {
            id: string;
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        };
        subject: {
            name: string;
            code: string;
        };
        class: {
            name: string;
        };
    } & {
        id: string;
        classId: string;
        teacherId: string;
        subjectId: string;
        sessionsPerWeek: number;
    })[]>;
    bulkSave(assignments: any[]): Promise<{
        success: boolean;
        count: number;
    }>;
}
