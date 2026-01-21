export declare class CreateTeacherDto {
    username: string;
    name: string;
    email: string;
    password?: string;
    subjects?: string[];
    joinYear?: number;
    address?: string;
    phone?: string;
}
export declare class UpdateTeacherDto {
    name?: string;
    email?: string;
    subjects?: string[];
    address?: string;
    phone?: string;
}
