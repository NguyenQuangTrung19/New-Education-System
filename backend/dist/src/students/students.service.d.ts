import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';
export declare class StudentsService {
    private prisma;
    private idGenerator;
    private passwordService;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService, passwordService: PasswordService);
    findAll(params?: any): Promise<({
        user: {
            username: string;
            email: string;
            name: string;
            avatarUrl: string | null;
        };
        class: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            academicYear: string;
            gradeLevel: number;
            room: string | null;
            teacherId: string | null;
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
    })[] | {
        data: ({
            user: {
                username: string;
                email: string;
                name: string;
                avatarUrl: string | null;
            };
            class: {
                id: string;
                name: string;
                description: string | null;
                notes: string[];
                academicYear: string;
                gradeLevel: number;
                room: string | null;
                teacherId: string | null;
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
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
        grades: ({
            subject: {
                id: string;
                name: string;
                code: string;
                department: string | null;
                description: string | null;
            };
        } & {
            id: string;
            studentId: string;
            academicYear: string;
            semester: string;
            subjectId: string;
            oralScore: number | null;
            fifteenMinScores: number[];
            midTermScore: number | null;
            finalScore: number | null;
            average: number | null;
            feedback: string | null;
        })[];
        class: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            academicYear: string;
            gradeLevel: number;
            room: string | null;
            teacherId: string | null;
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
        attendance: {
            id: string;
            studentId: string;
            status: import(".prisma/client").$Enums.AttendanceStatus;
            scheduleId: string | null;
            date: Date;
            note: string | null;
        }[];
        tuitions: {
            id: string;
            studentId: string;
            academicYear: string;
            semester: string;
            totalAmount: number;
            totalPaid: number;
            status: import(".prisma/client").$Enums.TuitionSemesterStatus;
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
