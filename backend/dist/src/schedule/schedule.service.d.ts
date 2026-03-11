import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class ScheduleService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createScheduleDto: CreateScheduleDto): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<{
        id: string;
        classId: string;
        room: string | null;
        teacherId: string | null;
        day: string;
        subjectId: string;
        period: number;
        session: string;
        weekStartDate: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findByWeek(weekStartDate: string, query?: any): Promise<{
        isBase: boolean;
        teacher: ({
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
        } & {
            id: string;
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        }) | null;
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        class: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        };
        id: string;
        classId: string;
        room: string | null;
        teacherId: string | null;
        day: string;
        subjectId: string;
        period: number;
        session: string;
        weekStartDate: Date | null;
    }[]>;
    findAll(query?: any): import(".prisma/client").Prisma.PrismaPromise<({
        teacher: ({
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
        } & {
            id: string;
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        }) | null;
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        class: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        classId: string;
        room: string | null;
        teacherId: string | null;
        day: string;
        subjectId: string;
        period: number;
        session: string;
        weekStartDate: Date | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<({
        teacher: ({
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
        } & {
            id: string;
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        }) | null;
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        class: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        classId: string;
        room: string | null;
        teacherId: string | null;
        day: string;
        subjectId: string;
        period: number;
        session: string;
        weekStartDate: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<({
        teacher: ({
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
        } & {
            id: string;
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        }) | null;
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        class: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        classId: string;
        room: string | null;
        teacherId: string | null;
        day: string;
        subjectId: string;
        period: number;
        session: string;
        weekStartDate: Date | null;
    }) | {
        isBase: boolean;
        _copyOnWrite: boolean;
        teacher: ({
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
        } & {
            id: string;
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        }) | null;
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        class: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        };
        id: string;
        classId: string;
        room: string | null;
        teacherId: string | null;
        day: string;
        subjectId: string;
        period: number;
        session: string;
        weekStartDate: Date | null;
    }>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<{
        id: string;
        classId: string;
        room: string | null;
        teacherId: string | null;
        day: string;
        subjectId: string;
        period: number;
        session: string;
        weekStartDate: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    copyWeek(sourceWeekStartDate: string, targetWeekStartDate: string, query?: {
        classId?: string;
        teacherId?: string;
    }): Promise<{
        success: boolean;
        count: number;
    }>;
}
