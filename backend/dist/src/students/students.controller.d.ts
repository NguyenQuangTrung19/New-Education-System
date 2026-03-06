import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(query: any): Promise<({
        user: {
            username: string;
            email: string;
            name: string;
            avatarUrl: string | null;
        };
        class: {
            id: string;
            name: string;
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
        class: {
            id: string;
            name: string;
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
                id: string;
                name: string;
                department: string | null;
                description: string | null;
                code: string;
            };
        } & {
            id: string;
            academicYear: string;
            subjectId: string;
            studentId: string;
            feedback: string | null;
            semester: string;
            oralScore: number | null;
            fifteenMinScores: number[];
            midTermScore: number | null;
            finalScore: number | null;
            average: number | null;
        })[];
        attendance: {
            id: string;
            status: import(".prisma/client").$Enums.AttendanceStatus;
            studentId: string;
            scheduleId: string | null;
            date: Date;
            note: string | null;
        }[];
        tuitions: {
            id: string;
            academicYear: string;
            status: import(".prisma/client").$Enums.TuitionSemesterStatus;
            studentId: string;
            semester: string;
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
    create(createStudentDto: CreateStudentDto): Promise<{
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
    update(id: string, updateStudentDto: UpdateStudentDto): Promise<{
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
