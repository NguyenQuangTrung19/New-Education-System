import { Gender } from '@prisma/client';
export declare class CreateTeacherDto {
    username: string;
    name: string;
    email: string;
    password?: string;
    subjects?: string[];
    classesAssigned?: number;
    joinYear?: number;
    address?: string;
    phone?: string;
    citizenId?: string;
    gender?: Gender;
    dateOfBirth?: string;
    notes?: string[];
}
export declare class UpdateTeacherDto {
    name?: string;
    email?: string;
    subjects?: string[];
    classesAssigned?: number;
    joinYear?: number;
    address?: string;
    phone?: string;
    citizenId?: string;
    gender?: Gender;
    dateOfBirth?: string;
    notes?: string[];
}
