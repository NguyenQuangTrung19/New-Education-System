import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class ScheduleService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createScheduleDto: CreateScheduleDto): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<{
        id: string;
        classId: string;
        day: string;
        room: string | null;
        teacherId: string | null;
        subjectId: string;
        period: number;
        session: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(query?: any): import(".prisma/client").Prisma.PrismaPromise<({
        teacher: ({
            user: {
                name: string;
                id: string;
                username: string;
                password: string;
                passwordEncrypted: string | null;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            phone: string | null;
            address: string | null;
            citizenId: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            joinYear: number | null;
            department: string | null;
            subjects: string[];
            classesAssigned: number;
            notes: string[];
            userId: string;
        }) | null;
        subject: {
            name: string;
            id: string;
            department: string | null;
            description: string | null;
            code: string;
        };
        class: {
            name: string;
            id: string;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            description: string | null;
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
        day: string;
        room: string | null;
        teacherId: string | null;
        subjectId: string;
        period: number;
        session: string;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<({
        teacher: ({
            user: {
                name: string;
                id: string;
                username: string;
                password: string;
                passwordEncrypted: string | null;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            phone: string | null;
            address: string | null;
            citizenId: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            joinYear: number | null;
            department: string | null;
            subjects: string[];
            classesAssigned: number;
            notes: string[];
            userId: string;
        }) | null;
        subject: {
            name: string;
            id: string;
            department: string | null;
            description: string | null;
            code: string;
        };
        class: {
            name: string;
            id: string;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            description: string | null;
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
        day: string;
        room: string | null;
        teacherId: string | null;
        subjectId: string;
        period: number;
        session: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<{
        id: string;
        classId: string;
        day: string;
        room: string | null;
        teacherId: string | null;
        subjectId: string;
        period: number;
        session: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<{
        id: string;
        classId: string;
        day: string;
        room: string | null;
        teacherId: string | null;
        subjectId: string;
        period: number;
        session: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
