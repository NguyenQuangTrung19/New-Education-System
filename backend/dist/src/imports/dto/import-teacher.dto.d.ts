import { Gender } from '../../students/dto/create-student.dto';
export declare class ImportTeacherDto {
    full_name: string;
    username: string;
    start_year: number;
    dob: any;
    gender: Gender;
    citizen_id: string;
    email: string;
    phone: string;
    address?: string;
    subjects: string;
}
