import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
export declare class AssignmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAssignmentDto): Promise<{
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
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        };
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        classes: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        teacherId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        subjectId: string;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(teacherId?: string, classId?: string): Promise<({
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
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        };
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        classes: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        }[];
        submissions: {
            id: string;
            studentId: string;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            feedback: string | null;
            score: number | null;
            answers: import("@prisma/client/runtime/library").JsonValue | null;
            assignmentId: string;
            submittedAt: Date;
        }[];
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        teacherId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        subjectId: string;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
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
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        };
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        classes: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        }[];
        submissions: ({
            student: {
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
                gender: import(".prisma/client").$Enums.Gender | null;
                classId: string | null;
                enrollmentYear: number;
                dateOfBirth: Date | null;
                gpa: number;
                address: string | null;
                guardianName: string | null;
                guardianPhone: string | null;
                guardianCitizenId: string | null;
                guardianYearOfBirth: number | null;
                guardianJob: string | null;
                semesterEvaluation: string | null;
                notes: string[];
                userId: string;
            };
        } & {
            id: string;
            studentId: string;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            feedback: string | null;
            score: number | null;
            answers: import("@prisma/client/runtime/library").JsonValue | null;
            assignmentId: string;
            submittedAt: Date;
        })[];
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        teacherId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        subjectId: string;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, dto: UpdateAssignmentDto): Promise<{
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
            department: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            dateOfBirth: Date | null;
            address: string | null;
            phone: string | null;
            notes: string[];
            subjects: string[];
            userId: string;
            citizenId: string | null;
            joinYear: number | null;
            classesAssigned: number;
        };
        subject: {
            id: string;
            name: string;
            code: string;
            department: string | null;
            description: string | null;
        };
        classes: {
            id: string;
            name: string;
            description: string | null;
            notes: string[];
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
            studentCount: number;
            maleStudentCount: number;
            femaleStudentCount: number;
            weeklyScoreHistory: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        teacherId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        subjectId: string;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        teacherId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        subjectId: string;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    submit(assignmentId: string, submitDto: SubmitAssignmentDto): Promise<{
        id: string;
        studentId: string;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        feedback: string | null;
        score: number | null;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        assignmentId: string;
        submittedAt: Date;
    }>;
    grade(submissionId: string, gradeDto: GradeSubmissionDto): Promise<{
        id: string;
        studentId: string;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        feedback: string | null;
        score: number | null;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        assignmentId: string;
        submittedAt: Date;
    }>;
}
