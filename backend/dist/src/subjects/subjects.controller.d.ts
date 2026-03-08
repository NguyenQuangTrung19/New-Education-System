import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    create(createSubjectDto: CreateSubjectDto): import(".prisma/client").Prisma.Prisma__SubjectClient<{
        id: string;
        name: string;
        code: string;
        department: string | null;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    getDepartments(): string[];
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        homeworks: {
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
            teacherId: string;
            status: import(".prisma/client").$Enums.HomeworkStatus;
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
    update(id: string, updateSubjectDto: UpdateSubjectDto): import(".prisma/client").Prisma.Prisma__SubjectClient<{
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
