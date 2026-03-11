import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    findAll(page?: string, limit?: string, search?: string, grade?: string, academicYear?: string): Promise<({
        teacher: ({
            user: {
                name: string;
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
        }) | null;
        _count: {
            students: number;
        };
    } & {
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
    })[] | {
        data: ({
            teacher: ({
                user: {
                    name: string;
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
            }) | null;
            _count: {
                students: number;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<({
        teacher: ({
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
        }) | null;
        scheduleItems: ({
            teacher: ({
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
            }) | null;
            subject: {
                id: string;
                name: string;
                code: string;
                department: string | null;
                description: string | null;
            };
        } & {
            id: string;
            classId: string;
            room: string | null;
            teacherId: string | null;
            day: string;
            subjectId: string;
            period: number;
            session: string;
            weekStartDate: Date | null;
        })[];
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
            subject: {
                id: string;
                name: string;
                code: string;
                department: string | null;
                description: string | null;
            };
        } & {
            id: string;
            classId: string;
            teacherId: string;
            subjectId: string;
            sessionsPerWeek: number;
        })[];
        students: ({
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
        })[];
    } & {
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
    }) | null>;
    create(createClassDto: CreateClassDto): Promise<{
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
    }>;
    update(id: string, updateClassDto: UpdateClassDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
