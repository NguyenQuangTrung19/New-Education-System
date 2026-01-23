import { PrismaService } from '../prisma/prisma.service';
export declare class SubjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSubjectDto: any): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        id: string;
        name: string;
        description: string | null;
        code: string;
        department: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        homeworks: {
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
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        code: string;
        department: string | null;
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
        } & {
            id: string;
            teacherId: string;
            classId: string;
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
            title: string;
            classIds: string[];
            dueDate: Date;
            duration: number | null;
            questions: import("@prisma/client/runtime/library").JsonValue | null;
            subjectId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        code: string;
        department: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateSubjectDto: any): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        id: string;
        name: string;
        description: string | null;
        code: string;
        department: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        id: string;
        name: string;
        description: string | null;
        code: string;
        department: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
