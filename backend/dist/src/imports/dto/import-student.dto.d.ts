import { Gender } from '../../students/dto/create-student.dto';
export declare class ImportStudentDto {
    student_code?: string;
    full_name: string;
    username: string;
    dob: any;
    gender: Gender;
    email?: string;
    address?: string;
    class_name: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_birth_year?: number;
    guardian_occupation?: string;
    guardian_citizen_id: string;
}
