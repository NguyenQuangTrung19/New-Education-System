export declare class CreateAssignmentDto {
    title: string;
    description?: string;
    subjectId: string;
    teacherId: string;
    classIds?: string[];
    dueDate: string | Date;
    duration?: number;
    password?: string;
    questions?: any;
}
export declare class UpdateAssignmentDto {
    title?: string;
    description?: string;
    dueDate?: string | Date;
    duration?: number;
    password?: string;
    questions?: any;
    status?: 'pending' | 'submitted' | 'late' | 'graded';
}
