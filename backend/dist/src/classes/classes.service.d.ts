import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
export declare class ClassesService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    findAll(): Promise<({
        teacher: ({
            user: {
                name: string;
            };
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
                name: string;
                username: string;
                password: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
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
        }) | null;
        students: ({
            user: {
                id: string;
                name: string;
                username: string;
                password: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            userId: string;
            address: string | null;
            dateOfBirth: Date | null;
            enrollmentYear: number;
            classId: string | null;
            gpa: number;
            guardianName: string | null;
            guardianCitizenId: string | null;
            guardianYearOfBirth: number | null;
            guardianJob: string | null;
            guardianPhone: string | null;
            semesterEvaluation: string | null;
            notes: string[];
        })[];
        scheduleItems: ({
            teacher: ({
                user: {
                    id: string;
                    name: string;
                    username: string;
                    password: string;
                    email: string;
                    role: import(".prisma/client").$Enums.UserRole;
                    avatarUrl: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
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
            day: string;
            period: number;
            session: string;
            subjectId: string;
        })[];
        teachingAssignments: ({
            teacher: {
                user: {
                    id: string;
                    name: string;
                    username: string;
                    password: string;
                    email: string;
                    role: import(".prisma/client").$Enums.UserRole;
                    avatarUrl: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
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
        name: string;
        gradeLevel: number;
        room: string | null;
        academicYear: string;
        teacherId: string | null;
        description: string | null;
        averageGpa: number;
        currentWeeklyScore: number;
    }) | null>;
    create(createClassDto: any): Promise<{
        id: string;
        name: string;
        gradeLevel: number;
        room: string | null;
        academicYear: string;
        teacherId: string | null;
        description: string | null;
        averageGpa: number;
        currentWeeklyScore: number;
    }>;
    update(id: string, updateClassDto: any): Promise<{
        id: string;
        name: string;
        gradeLevel: number;
        room: string | null;
        academicYear: string;
        teacherId: string | null;
        description: string | null;
        averageGpa: number;
        currentWeeklyScore: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        gradeLevel: number;
        room: string | null;
        academicYear: string;
        teacherId: string | null;
        description: string | null;
        averageGpa: number;
        currentWeeklyScore: number;
    }>;
}
