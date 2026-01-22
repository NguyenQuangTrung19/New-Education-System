import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
export declare class AssignmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAssignmentDto: CreateAssignmentDto): import(".prisma/client").Prisma.Prisma__AssignmentClient<{
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        teacherId: string;
        description: string | null;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
        subjectId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
        classes: {
            id: string;
            name: string;
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            description: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
        }[];
        submissions: {
            id: string;
            studentId: string;
            feedback: string | null;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            assignmentId: string;
            submittedAt: Date;
            answers: import("@prisma/client/runtime/library").JsonValue | null;
            score: number | null;
        }[];
        subject: {
            id: string;
            name: string;
            description: string | null;
            code: string;
            department: string | null;
        };
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        teacherId: string;
        description: string | null;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
        subjectId: string;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__AssignmentClient<({
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
        classes: {
            id: string;
            name: string;
            gradeLevel: number;
            room: string | null;
            academicYear: string;
            teacherId: string | null;
            description: string | null;
            averageGpa: number;
            currentWeeklyScore: number;
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
            };
        } & {
            id: string;
            studentId: string;
            feedback: string | null;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            assignmentId: string;
            submittedAt: Date;
            answers: import("@prisma/client/runtime/library").JsonValue | null;
            score: number | null;
        })[];
        subject: {
            id: string;
            name: string;
            description: string | null;
            code: string;
            department: string | null;
        };
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        teacherId: string;
        description: string | null;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
        subjectId: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateAssignmentDto: UpdateAssignmentDto): import(".prisma/client").Prisma.Prisma__AssignmentClient<{
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        teacherId: string;
        description: string | null;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
        subjectId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__AssignmentClient<{
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        teacherId: string;
        description: string | null;
        title: string;
        classIds: string[];
        dueDate: Date;
        duration: number | null;
        questions: import("@prisma/client/runtime/library").JsonValue | null;
        subjectId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
