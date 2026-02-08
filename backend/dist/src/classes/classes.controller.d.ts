import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    findAll(): Promise<({
        teacher: ({
            user: {
                name: string;
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
        }) | null;
        _count: {
            students: number;
        };
    } & {
        id: string;
        name: string;
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
    })[]>;
    findOne(id: string): Promise<({
        teacher: ({
            user: {
                id: string;
                username: string;
                email: string;
                password: string;
                passwordEncrypted: string | null;
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
            department: string | null;
            subjects: string[];
            classesAssigned: number;
            notes: string[];
            userId: string;
        }) | null;
        teachingAssignments: ({
            teacher: {
                user: {
                    id: string;
                    username: string;
                    email: string;
                    password: string;
                    passwordEncrypted: string | null;
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
                department: string | null;
                subjects: string[];
                classesAssigned: number;
                notes: string[];
                userId: string;
            };
            subject: {
                id: string;
                name: string;
                department: string | null;
                description: string | null;
                code: string;
            };
        } & {
            id: string;
            teacherId: string;
            classId: string;
            subjectId: string;
            sessionsPerWeek: number;
        })[];
        scheduleItems: ({
            teacher: ({
                user: {
                    id: string;
                    username: string;
                    email: string;
                    password: string;
                    passwordEncrypted: string | null;
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
                department: string | null;
                subjects: string[];
                classesAssigned: number;
                notes: string[];
                userId: string;
            }) | null;
            subject: {
                id: string;
                name: string;
                department: string | null;
                description: string | null;
                code: string;
            };
        } & {
            id: string;
            room: string | null;
            teacherId: string | null;
            classId: string;
            subjectId: string;
            day: string;
            period: number;
            session: string;
        })[];
        students: ({
            user: {
                id: string;
                username: string;
                email: string;
                password: string;
                passwordEncrypted: string | null;
                name: string;
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
        })[];
    } & {
        id: string;
        name: string;
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
    }) | null>;
    create(createClassDto: CreateClassDto): Promise<{
        id: string;
        name: string;
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
    }>;
    update(id: string, updateClassDto: UpdateClassDto): Promise<{
        id: string;
        name: string;
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
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
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
    }>;
}
