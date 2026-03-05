import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    create(createAssignmentDto: CreateAssignmentDto): Promise<{
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
        classes: {
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
        }[];
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        teacherId: string;
        description: string | null;
        subjectId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(teacherId?: string, classId?: string): Promise<({
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
        classes: {
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
        }[];
        submissions: {
            id: string;
            studentId: string;
            feedback: string | null;
            status: import(".prisma/client").$Enums.AssignmentStatus;
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
        teacherId: string;
        description: string | null;
        subjectId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
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
        classes: {
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
        }[];
        submissions: ({
            student: {
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
            };
        } & {
            id: string;
            studentId: string;
            feedback: string | null;
            status: import(".prisma/client").$Enums.AssignmentStatus;
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
        teacherId: string;
        description: string | null;
        subjectId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<{
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
        classes: {
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
        }[];
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        teacherId: string;
        description: string | null;
        subjectId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
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
        teacherId: string;
        description: string | null;
        subjectId: string;
        status: import(".prisma/client").$Enums.HomeworkStatus;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    submit(id: string, submitDto: SubmitAssignmentDto): Promise<{
        id: string;
        studentId: string;
        feedback: string | null;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        score: number | null;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        assignmentId: string;
        submittedAt: Date;
    }>;
    grade(submissionId: string, gradeDto: GradeSubmissionDto): Promise<{
        id: string;
        studentId: string;
        feedback: string | null;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        score: number | null;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        assignmentId: string;
        submittedAt: Date;
    }>;
}
