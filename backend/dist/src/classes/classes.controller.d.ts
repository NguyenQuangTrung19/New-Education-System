import { ClassesService } from './classes.service';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    findAll(): Promise<({
        teacher: ({
            user: {
                name: string;
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
        _count: {
            students: number;
        };
    } & {
        id: string;
        name: string;
        gradeLevel: number;
        room: string | null;
        academicYear: string;
        teacherId: string | null;
        description: string | null;
        averageGpa: number;
        currentWeeklyScore: number;
    })[]>;
    findOne(id: string): Promise<({
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
        teachingAssignments: ({
            teacher: {
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
        scheduleItems: ({
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
        })[];
        students: ({
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
            address: string | null;
            dateOfBirth: Date | null;
            userId: string;
            enrollmentYear: number;
            gpa: number;
            guardianName: string | null;
            guardianCitizenId: string | null;
            guardianYearOfBirth: number | null;
            guardianJob: string | null;
            guardianPhone: string | null;
            semesterEvaluation: string | null;
            notes: string[];
            classId: string | null;
        })[];
    } & {
        id: string;
        name: string;
        gradeLevel: number;
        room: string | null;
        academicYear: string;
        teacherId: string | null;
        description: string | null;
        averageGpa: number;
        currentWeeklyScore: number;
    }) | null>;
}
