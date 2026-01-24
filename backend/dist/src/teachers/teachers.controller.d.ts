import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/create-teacher.dto';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    findAll(): Promise<({
        user: {
            email: string;
            name: string;
            avatarUrl: string | null;
        };
        classes: {
            id: string;
            name: string;
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            description: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
        }[];
    } & {
        id: string;
        userId: string;
        phone: string | null;
        address: string | null;
        citizenId: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        dateOfBirth: Date | null;
        joinYear: number | null;
        subjects: string[];
        classesAssigned: number;
    })[]>;
    findOne(id: string): Promise<({
        user: {
            id: string;
            username: string;
            password: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        classes: {
            id: string;
            name: string;
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            description: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
        }[];
        teachingAssignments: ({
            subject: {
                id: string;
                name: string;
                description: string | null;
                code: string;
                department: string | null;
            };
            class: {
                id: string;
                name: string;
                gradeLevel: number;
                room: string | null;
                academicYear: string;
                teacherId: string | null;
                description: string | null;
                averageGpa: number;
                currentWeeklyScore: number;
            };
        } & {
            id: string;
            teacherId: string;
            subjectId: string;
            classId: string;
            sessionsPerWeek: number;
        })[];
    } & {
        id: string;
        userId: string;
        phone: string | null;
        address: string | null;
        citizenId: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        dateOfBirth: Date | null;
        joinYear: number | null;
        subjects: string[];
        classesAssigned: number;
    }) | null>;
    create(createTeacherDto: CreateTeacherDto): Promise<{
        user: {
            id: string;
            username: string;
            password: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        userId: string;
        phone: string | null;
        address: string | null;
        citizenId: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        dateOfBirth: Date | null;
        joinYear: number | null;
        subjects: string[];
        classesAssigned: number;
    }>;
    update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<{
        id: string;
        userId: string;
        phone: string | null;
        address: string | null;
        citizenId: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        dateOfBirth: Date | null;
        joinYear: number | null;
        subjects: string[];
        classesAssigned: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        username: string;
        password: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
