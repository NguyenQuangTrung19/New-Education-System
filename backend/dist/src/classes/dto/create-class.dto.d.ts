export declare class CreateClassDto {
    name: string;
    gradeLevel: number;
    room?: string;
    academicYear?: string;
    teacherId?: string;
    studentCount?: number;
    maleStudentCount?: number;
    femaleStudentCount?: number;
    averageGpa?: number;
    currentWeeklyScore?: number;
    weeklyScoreHistory?: Array<{
        week: number;
        score: number;
    }>;
    description?: string;
    notes?: string[];
}
