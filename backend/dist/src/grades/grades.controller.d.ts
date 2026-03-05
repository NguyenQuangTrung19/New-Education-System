import { GradesService } from './grades.service';
export declare class GradesController {
    private readonly gradesService;
    constructor(gradesService: GradesService);
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
        subjectId: string;
        studentId: string;
        feedback: string | null;
        semester: string;
        oralScore: number | null;
        fifteenMinScores: number[];
        midTermScore: number | null;
        finalScore: number | null;
        average: number | null;
    })[]>;
    bulkSave(payload: any[]): Promise<{
        success: boolean;
        count: number;
    }>;
}
