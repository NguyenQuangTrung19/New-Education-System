import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(): Promise<({
        user: {
            username: string;
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
        userId: string;
        dateOfBirth: Date | null;
        enrollmentYear: number;
        classId: string | null;
        gpa: number;
        address: string | null;
        guardianName: string | null;
        guardianCitizenId: string | null;
        guardianYearOfBirth: number | null;
        guardianJob: string | null;
        guardianPhone: string | null;
        semesterEvaluation: string | null;
        notes: string[];
    })[]>;
    findOne(id: string): Promise<({
        user: {
            id: string;
            username: string;
            password: string;
            email: string;
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
            studentId: string;
            year: string;
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
        userId: string;
        dateOfBirth: Date | null;
        enrollmentYear: number;
        classId: string | null;
        gpa: number;
        address: string | null;
        guardianName: string | null;
        guardianCitizenId: string | null;
        guardianYearOfBirth: number | null;
        guardianJob: string | null;
        guardianPhone: string | null;
        semesterEvaluation: string | null;
        notes: string[];
    }) | null>;
    create(createStudentDto: CreateStudentDto): Promise<{
        user: {
            id: string;
            username: string;
            password: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        userId: string;
        dateOfBirth: Date | null;
        enrollmentYear: number;
        classId: string | null;
        gpa: number;
        address: string | null;
        guardianName: string | null;
        guardianCitizenId: string | null;
        guardianYearOfBirth: number | null;
        guardianJob: string | null;
        guardianPhone: string | null;
        semesterEvaluation: string | null;
        notes: string[];
    }>;
    update(id: string, updateStudentDto: UpdateStudentDto): Promise<{
        id: string;
        userId: string;
        dateOfBirth: Date | null;
        enrollmentYear: number;
        classId: string | null;
        gpa: number;
        address: string | null;
        guardianName: string | null;
        guardianCitizenId: string | null;
        guardianYearOfBirth: number | null;
        guardianJob: string | null;
        guardianPhone: string | null;
        semesterEvaluation: string | null;
        notes: string[];
    }>;
    remove(id: string): Promise<{
        id: string;
        username: string;
        password: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
