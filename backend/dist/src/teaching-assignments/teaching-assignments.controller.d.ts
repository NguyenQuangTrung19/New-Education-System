import { TeachingAssignmentsService } from './teaching-assignments.service';
export declare class TeachingAssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: TeachingAssignmentsService);
    findAll(): Promise<({
        teacher: {
            user: {
                name: string;
            };
        } & {
            id: string;
            phone: string | null;
            address: string | null;
            citizenId: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            joinYear: number | null;
            department: string | null;
            subjects: string[];
            classesAssigned: number;
            notes: string[];
            userId: string;
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
    bulkSave(payload: any[]): Promise<{
        success: boolean;
        count: number;
    }>;
}
