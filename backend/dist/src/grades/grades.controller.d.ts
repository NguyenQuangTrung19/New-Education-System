import { GradesService } from './grades.service';
export declare class GradesController {
    private readonly gradesService;
    constructor(gradesService: GradesService);
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
        subjectId: string;
        semester: string;
        academicYear: string;
        oralScore: number | null;
        fifteenMinScores: number[];
        midTermScore: number | null;
        finalScore: number | null;
        average: number | null;
        feedback: string | null;
    })[]>;
    bulkSave(payload: any[]): Promise<{
        success: boolean;
        count: number;
    }>;
}
