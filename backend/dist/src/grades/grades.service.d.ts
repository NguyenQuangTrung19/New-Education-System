import { PrismaService } from '../prisma/prisma.service';
export declare class GradesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(classId?: string, subjectId?: string, studentId?: string): Promise<({
        student: {
            user: {
                name: string;
            };
            id: string;
        };
        subject: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        academicYear: string;
        studentId: string;
        subjectId: string;
        semester: string;
        oralScore: number | null;
        fifteenMinScores: number[];
        midTermScore: number | null;
        finalScore: number | null;
        average: number | null;
        feedback: string | null;
    })[]>;
    bulkSave(grades: any[]): Promise<{
        success: boolean;
        count: number;
    }>;
}
