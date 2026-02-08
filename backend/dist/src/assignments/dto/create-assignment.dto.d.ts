export declare class CreateAssignmentDto {
    title: string;
    description?: string;
    subjectId: string;
    teacherId: string;
    classIds?: string[];
    dueDate: string;
    duration?: number;
    password?: string;
    questions?: any;
}
