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
exports.GradesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GradesService = class GradesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(classId, subjectId, studentId) {
        const where = {};
        if (subjectId) {
            where.subjectId = subjectId;
        }
        if (studentId) {
            where.studentId = studentId;
        }
        if (classId) {
            where.student = { classId };
        }
        return this.prisma.studentGrade.findMany({
            where,
            include: {
                student: { select: { id: true, user: { select: { name: true } } } },
                subject: { select: { id: true, name: true } },
            },
        });
    }
    async bulkSave(grades) {
        if (!grades || !grades.length) {
            return { success: true, count: 0 };
        }
        return this.prisma.$transaction(async (tx) => {
            for (const grade of grades) {
                if (!grade.studentId || !grade.subjectId) {
                    throw new common_1.BadRequestException('studentId and subjectId are required for all grades');
                }
                const existing = await tx.studentGrade.findFirst({
                    where: {
                        studentId: grade.studentId,
                        subjectId: grade.subjectId,
                        semester: grade.semester || 'HK1',
                        academicYear: grade.academicYear || '2025-2026',
                    },
                });
                const dataToSave = {
                    studentId: grade.studentId,
                    subjectId: grade.subjectId,
                    semester: grade.semester || 'HK1',
                    academicYear: grade.academicYear || '2025-2026',
                    oralScore: grade.oralScore ?? null,
                    fifteenMinScores: grade.fifteenMinScores || [],
                    midTermScore: grade.midTermScore ?? null,
                    finalScore: grade.finalScore ?? null,
                    average: grade.average ?? null,
                    feedback: grade.feedback ?? null,
                };
                if (existing) {
                    await tx.studentGrade.update({
                        where: { id: existing.id },
                        data: dataToSave,
                    });
                }
                else {
                    await tx.studentGrade.create({
                        data: dataToSave,
                    });
                }
            }
            return { success: true, count: grades.length };
        });
    }
};
exports.GradesService = GradesService;
exports.GradesService = GradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GradesService);
//# sourceMappingURL=grades.service.js.map