import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
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
        _count: {
            students: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<({
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
        teachingAssignments: ({
            teacher: {
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
            };
            subject: {
                name: string;
                id: string;
                department: string | null;
                description: string | null;
                code: string;
            };
        } & {
            id: string;
            classId: string;
            teacherId: string;
            subjectId: string;
            sessionsPerWeek: number;
        })[];
        scheduleItems: ({
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
        } & {
            id: string;
            classId: string;
            day: string;
            room: string | null;
            teacherId: string | null;
            subjectId: string;
            period: number;
            session: string;
        })[];
        students: ({
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
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            notes: string[];
            userId: string;
            enrollmentYear: number;
            gpa: number;
            guardianName: string | null;
            guardianCitizenId: string | null;
            guardianYearOfBirth: number | null;
            guardianJob: string | null;
            guardianPhone: string | null;
            semesterEvaluation: string | null;
            classId: string | null;
        })[];
    } & {
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
    }) | null>;
    create(createClassDto: CreateClassDto): Promise<{
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
    }>;
    update(id: string, updateClassDto: UpdateClassDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
