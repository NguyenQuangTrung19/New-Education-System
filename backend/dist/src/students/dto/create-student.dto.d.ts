export declare enum Gender {
    Male = "Male",
    Female = "Female",
    Other = "Other"
}
export declare class CreateStudentDto {
    username: string;
    name: string;
    email: string;
    password?: string;
    gender?: Gender;
    classId?: string;
    enrollmentYear?: number;
    dateOfBirth?: string;
    gpa?: number;
    address?: string;
    phone?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianCitizenId?: string;
    guardianYearOfBirth?: number;
    guardianJob?: string;
    semesterEvaluation?: string;
    notes?: string[];
}
export declare class UpdateStudentDto {
    name?: string;
    email?: string;
    gender?: Gender;
    classId?: string;
    gpa?: number;
    enrollmentYear?: number;
    dateOfBirth?: string;
    address?: string;
    phone?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianCitizenId?: string;
    guardianYearOfBirth?: number;
    guardianJob?: string;
    semesterEvaluation?: string;
    notes?: string[];
}
