import { PrismaService } from '../prisma/prisma.service';
export declare class SubjectsService {
    private prisma;
    constructor(prisma: PrismaService);
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
            description: string | null;
            title: string;
            subjectId: string;
            teacherId: string;
            classIds: string[];
            dueDate: Date;
            duration: number | null;
            password: string | null;
            questions: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
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
                    name: string;
                    password: string;
                    createdAt: Date;
                    updatedAt: Date;
                    username: string;
                    email: string;
                    role: import(".prisma/client").$Enums.UserRole;
                    avatarUrl: string | null;
                };
            } & {
                id: string;
                userId: string;
                phone: string | null;
                address: string | null;
                citizenId: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
                dateOfBirth: Date | null;
                joinYear: number | null;
                subjects: string[];
                classesAssigned: number;
            };
        } & {
            id: string;
            subjectId: string;
            teacherId: string;
            classId: string;
            sessionsPerWeek: number;
        })[];
        homeworks: {
            id: string;
            description: string | null;
            title: string;
            subjectId: string;
            teacherId: string;
            classIds: string[];
            dueDate: Date;
            duration: number | null;
            password: string | null;
            questions: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
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
    remove(id: string): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        id: string;
        name: string;
        code: string;
        department: string | null;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
