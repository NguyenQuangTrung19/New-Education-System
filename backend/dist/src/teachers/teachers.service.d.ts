import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
export declare class TeachersService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    findAll(): Promise<({
        user: {
            username: string;
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
        phone: string | null;
        address: string | null;
        citizenId: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        dateOfBirth: Date | null;
        joinYear: number | null;
        subjects: string[];
        classesAssigned: number;
        userId: string;
    })[]>;
    findOne(id: string): Promise<({
        user: {
            id: string;
            username: string;
            email: string;
            password: string;
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
            subject: {
                id: string;
                name: string;
                description: string | null;
                code: string;
                department: string | null;
            };
        } & {
            id: string;
            teacherId: string;
            classId: string;
            subjectId: string;
            sessionsPerWeek: number;
        })[];
    } & {
        id: string;
        phone: string | null;
        address: string | null;
        citizenId: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        dateOfBirth: Date | null;
        joinYear: number | null;
        subjects: string[];
        classesAssigned: number;
        userId: string;
    }) | null>;
    create(createTeacherDto: any): Promise<{
        user: {
            id: string;
            username: string;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        phone: string | null;
        address: string | null;
        citizenId: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        dateOfBirth: Date | null;
        joinYear: number | null;
        subjects: string[];
        classesAssigned: number;
        userId: string;
    }>;
    update(id: string, updateTeacherDto: any): Promise<{
        id: string;
        phone: string | null;
        address: string | null;
        citizenId: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        dateOfBirth: Date | null;
        joinYear: number | null;
        subjects: string[];
        classesAssigned: number;
        userId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
