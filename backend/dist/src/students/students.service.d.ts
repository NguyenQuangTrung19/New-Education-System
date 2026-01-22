import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        user: {
            email: string;
            name: string;
            avatarUrl: string | null;
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
        } | null;
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
                id: string;
                name: string;
                description: string | null;
                code: string;
                department: string | null;
            };
        } & {
            id: string;
            academicYear: string;
            subjectId: string;
            studentId: string;
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
    }>;
    update(id: string, updateStudentDto: any): Promise<{
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
    }>;
}
