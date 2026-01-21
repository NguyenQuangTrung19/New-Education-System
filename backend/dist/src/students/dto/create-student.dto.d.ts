export declare class CreateStudentDto {
    username: string;
    name: string;
    email: string;
    password?: string;
    classId?: string;
    enrollmentYear?: number;
    address?: string;
    phone?: string;
    guardianName?: string;
    guardianPhone?: string;
}
export declare class UpdateStudentDto {
    name?: string;
    email?: string;
    classId?: string;
    gpa?: number;
    address?: string;
    phone?: string;
}
