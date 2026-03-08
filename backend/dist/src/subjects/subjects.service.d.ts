import { PrismaService } from '../prisma/prisma.service';
export declare class SubjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    static readonly DEPARTMENTS: string[];
    getDepartments(): string[];
    create(createSubjectDto: any): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        id: string;
        name: string;
        code: string;
        department: string | null;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        homeworks: {
            id: string;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.HomeworkStatus;
            teacherId: string;
            subjectId: string;
            title: string;
            classIds: string[];
            dueDate: Date;
            duration: number | null;
            questions: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        department: string | null;
        description: string | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__SubjectClient<({
        teachingAssignments: ({
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
                phone: string | null;
                address: string | null;
                citizenId: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
                dateOfBirth: Date | null;
                joinYear: number | null;
                subjects: string[];
                classesAssigned: number;
                notes: string[];
                userId: string;
            };
        } & {
            id: string;
            classId: string;
            teacherId: string;
            subjectId: string;
            sessionsPerWeek: number;
        })[];
        homeworks: {
            id: string;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.HomeworkStatus;
            teacherId: string;
            subjectId: string;
            title: string;
            classIds: string[];
            dueDate: Date;
            duration: number | null;
            questions: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        department: string | null;
        description: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateSubjectDto: any): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        id: string;
        name: string;
        code: string;
        department: string | null;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        code: string;
        department: string | null;
        description: string | null;
    }>;
}
