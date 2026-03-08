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
exports.TeachingAssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeachingAssignmentsService = class TeachingAssignmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.teachingAssignment.findMany({
            include: {
                teacher: {
                    include: { user: { select: { name: true } } }
                },
                class: { select: { name: true } },
                subject: { select: { name: true, code: true } }
            }
        });
    }
    async bulkSave(assignments) {
        const teacherLoads = {};
        const classLoads = {};
        for (const a of assignments) {
            if (!a.teacherId || !a.classId || !a.subjectId) {
                throw new common_1.BadRequestException('Missing required fields in assignment payload.');
            }
            const sessions = Number(a.sessionsPerWeek) || 1;
            teacherLoads[a.teacherId] = (teacherLoads[a.teacherId] || 0) + sessions;
            classLoads[a.classId] = (classLoads[a.classId] || 0) + sessions;
        }
        for (const [tId, load] of Object.entries(teacherLoads)) {
            if (load > 40) {
                throw new common_1.BadRequestException(`Teacher ${tId} is overloaded with ${load} periods (Max: 40).`);
            }
        }
        for (const [cId, load] of Object.entries(classLoads)) {
            if (load > 40) {
                throw new common_1.BadRequestException(`Class ${cId} is overloaded with ${load} periods (Max: 40).`);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.teachingAssignment.deleteMany({});
            const toInsert = assignments.map(a => ({
                teacherId: a.teacherId,
                subjectId: a.subjectId,
                classId: a.classId,
                sessionsPerWeek: Number(a.sessionsPerWeek) || 1
            }));
            if (toInsert.length > 0) {
                await tx.teachingAssignment.createMany({ data: toInsert });
            }
            return { success: true, count: toInsert.length };
        });
    }
};
exports.TeachingAssignmentsService = TeachingAssignmentsService;
exports.TeachingAssignmentsService = TeachingAssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachingAssignmentsService);
//# sourceMappingURL=teaching-assignments.service.js.map