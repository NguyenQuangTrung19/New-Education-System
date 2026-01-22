import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    create(createScheduleDto: CreateScheduleDto): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<{
        id: string;
        room: string | null;
        teacherId: string | null;
        classId: string;
        subjectId: string;
        day: string;
        period: number;
        session: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(query: any): import(".prisma/client").Prisma.PrismaPromise<({
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
            phone: string | null;
            address: string | null;
            citizenId: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            joinYear: number | null;
            subjects: string[];
            classesAssigned: number;
            userId: string;
        }) | null;
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
        room: string | null;
        teacherId: string | null;
        classId: string;
        subjectId: string;
        day: string;
        period: number;
        session: string;
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
            phone: string | null;
            address: string | null;
            citizenId: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            joinYear: number | null;
            subjects: string[];
            classesAssigned: number;
            userId: string;
        }) | null;
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
        room: string | null;
        teacherId: string | null;
        classId: string;
        subjectId: string;
        day: string;
        period: number;
        session: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<{
        id: string;
        room: string | null;
        teacherId: string | null;
        classId: string;
        subjectId: string;
        day: string;
        period: number;
        session: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ScheduleItemClient<{
        id: string;
        room: string | null;
        teacherId: string | null;
        classId: string;
        subjectId: string;
        day: string;
        period: number;
        session: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
