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
    update(id: string, updateSubjectDto: UpdateSubjectDto): import(".prisma/client").Prisma.Prisma__SubjectClient<{
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
