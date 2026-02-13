import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';
export declare class StudentsService {
    private prisma;
    private idGenerator;
    private passwordService;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService, passwordService: PasswordService);
    findAll(): Promise<({
        user: {
            name: string;
            username: string;
            email: string;
            avatarUrl: string | null;
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
        } | null;
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
    })[]>;
    findOne(id: string): Promise<({
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
        } | null;
        academicHistory: {
            id: string;
            gpa: number;
            year: string;
            studentId: string;
            className: string;
        }[];
        grades: ({
            subject: {
                name: string;
                id: string;
                department: string | null;
                description: string | null;
                code: string;
            };
        } & {
            id: string;
            academicYear: string;
            studentId: string;
            subjectId: string;
            semester: string;
            oralScore: number | null;
            fifteenMinScores: number[];
            midTermScore: number | null;
            finalScore: number | null;
            average: number | null;
            feedback: string | null;
        })[];
        attendance: {
            id: string;
            studentId: string;
            scheduleId: string | null;
            date: Date;
            status: import(".prisma/client").$Enums.AttendanceStatus;
            note: string | null;
        }[];
        tuitions: {
            id: string;
            academicYear: string;
            studentId: string;
            semester: string;
            status: import(".prisma/client").$Enums.TuitionSemesterStatus;
            totalAmount: number;
            totalPaid: number;
        }[];
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
    }) | null>;
    create(createStudentDto: any): Promise<{
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
    }>;
    update(id: string, updateStudentDto: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    } | null>;
}
