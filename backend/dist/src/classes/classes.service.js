"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../common/id-generator.service");
let ClassesService = class ClassesService {
    prisma;
    idGenerator;
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async findAll(params) {
        const page = params?.page ? parseInt(params.page, 10) : undefined;
        const limit = params?.limit ? parseInt(params.limit, 10) : undefined;
        const search = params?.search || '';
        const gradeLevel = params?.grade ? parseInt(params.grade, 10) : undefined;
        const academicYear = params?.academicYear || undefined;
        const where = {};
        if (academicYear) {
            where.academicYear = academicYear;
        }
        if (gradeLevel) {
            where.gradeLevel = gradeLevel;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { room: { contains: search, mode: 'insensitive' } },
                {
                    teacher: {
                        user: { name: { contains: search, mode: 'insensitive' } },
                    },
                },
            ];
        }
        const includeConfig = {
            teacher: {
                include: { user: { select: { name: true } } },
            },
            _count: {
                select: { students: true },
            },
        };
        if (page !== undefined && limit !== undefined) {
            const skip = (page - 1) * limit;
            const [total, classes] = await this.prisma.$transaction([
                this.prisma.classGroup.count({ where }),
                this.prisma.classGroup.findMany({
                    where,
                    skip,
                    take: limit,
                    include: includeConfig,
                    orderBy: { name: 'asc' },
                }),
            ]);
            return {
                data: classes,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        else {
            return this.prisma.classGroup.findMany({
                where,
                include: includeConfig,
                orderBy: { name: 'asc' },
            });
        }
    }
    async findOne(id) {
        return this.prisma.classGroup.findUnique({
            where: { id },
            include: {
                teacher: { include: { user: true } },
                students: { include: { user: true } },
                scheduleItems: {
                    include: { subject: true, teacher: { include: { user: true } } },
                },
                teachingAssignments: {
                    include: { subject: true, teacher: { include: { user: true } } },
                },
            },
        });
    }
    async create(createClassDto) {
        const { academicYear, ...validClassData } = createClassDto;
        const year = academicYear ||
            `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
        const classId = await this.idGenerator.generateClassId(year);
        return this.prisma.classGroup.create({
            data: {
                id: classId,
                academicYear: year,
                name: validClassData.name,
                gradeLevel: validClassData.gradeLevel,
                room: validClassData.room,
                teacherId: validClassData.teacherId || null,
                description: validClassData.description,
                averageGpa: validClassData.averageGpa ?? 0,
                currentWeeklyScore: validClassData.currentWeeklyScore ?? 100,
                studentCount: validClassData.studentCount ?? 0,
                maleStudentCount: validClassData.maleStudentCount ?? 0,
                femaleStudentCount: validClassData.femaleStudentCount ?? 0,
                weeklyScoreHistory: validClassData.weeklyScoreHistory ?? [],
                notes: validClassData.notes ?? [],
            },
        });
    }
    async update(id, updateClassDto) {
        const { ...validUpdateData } = updateClassDto;
        const normalizedUpdateData = { ...validUpdateData };
        if (Object.prototype.hasOwnProperty.call(validUpdateData, 'teacherId')) {
            normalizedUpdateData.teacherId = validUpdateData.teacherId || null;
        }
        if (Object.prototype.hasOwnProperty.call(validUpdateData, 'weeklyScoreHistory')) {
            normalizedUpdateData.weeklyScoreHistory =
                validUpdateData.weeklyScoreHistory ?? [];
        }
        if (Object.prototype.hasOwnProperty.call(validUpdateData, 'notes')) {
            normalizedUpdateData.notes = validUpdateData.notes ?? [];
        }
        return this.prisma.classGroup.update({
            where: { id },
            data: normalizedUpdateData,
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (prisma) => {
            await prisma.student.updateMany({
                where: { classId: id },
                data: { classId: null },
            });
            await prisma.scheduleItem.deleteMany({
                where: { classId: id },
            });
            await prisma.teachingAssignment.deleteMany({
                where: { classId: id },
            });
            return prisma.classGroup.delete({
                where: { id },
            });
        });
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map