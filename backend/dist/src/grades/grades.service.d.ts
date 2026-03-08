import { PrismaService } from '../prisma/prisma.service';
export declare class GradesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(classId?: string, subjectId?: string, studentId?: string): Promise<({
        student: {
            id: string;
            user: {
                name: string;
            };
        };
        subject: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        studentId: string;
        academicYear: string;
        semester: string;
        subjectId: string;
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
