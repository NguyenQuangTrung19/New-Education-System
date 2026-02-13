import { PrismaService } from '../prisma/prisma.service';
export declare class SubjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    static readonly DEPARTMENTS: string[];
    getDepartments(): string[];
    create(createSubjectDto: any): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        name: string;
        id: string;
        department: string | null;
        description: string | null;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        homeworks: {
            id: string;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            teacherId: string;
            description: string | null;
            subjectId: string;
            title: string;
            classIds: string[];
            dueDate: Date;
            duration: number | null;
            questions: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        name: string;
        id: string;
        department: string | null;
        description: string | null;
        code: string;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__SubjectClient<({
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
            teacherId: string;
            description: string | null;
            subjectId: string;
            title: string;
            classIds: string[];
            dueDate: Date;
            duration: number | null;
            questions: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        name: string;
        id: string;
        department: string | null;
        description: string | null;
        code: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateSubjectDto: any): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        name: string;
        id: string;
        department: string | null;
        description: string | null;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        name: string;
        id: string;
        department: string | null;
        description: string | null;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
