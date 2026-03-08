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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AssignmentsService = class AssignmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const { classIds = [], teacherId, subjectId, status, ...data } = dto;
        const existing = await this.prisma.assignment.findFirst({
            where: { title: dto.title, subjectId, teacherId },
        });
        if (existing) {
            throw new common_1.ConflictException(`An assignment titled "${dto.title}" for this subject and teacher already exists.`);
        }
        return this.prisma.assignment.create({
            data: {
                ...data,
                subject: { connect: { id: subjectId } },
                teacher: { connect: { id: teacherId } },
                classes: { connect: classIds.map((id) => ({ id })) },
                classIds,
                status: status ?? client_1.HomeworkStatus.ACTIVE,
            },
            include: { subject: true, teacher: { include: { user: true } }, classes: true },
        });
    }
    async findAll(teacherId, classId) {
        const where = {};
        if (teacherId)
            where.teacherId = teacherId;
        if (classId)
            where.classes = { some: { id: classId } };
        return this.prisma.assignment.findMany({
            where,
            include: {
                subject: true,
                teacher: { include: { user: true } },
                classes: true,
                submissions: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: {
                subject: true,
                teacher: { include: { user: true } },
                classes: true,
                submissions: { include: { student: { include: { user: true } } } },
            },
        });
        if (!assignment)
            throw new common_1.NotFoundException(`Assignment ${id} not found.`);
        return assignment;
    }
    async update(id, dto) {
        await this.findOne(id);
        const { classIds, teacherId, subjectId, status, ...rest } = dto;
        return this.prisma.assignment.update({
            where: { id },
            data: {
                ...rest,
                ...(status && { status: status }),
                ...(subjectId && { subject: { connect: { id: subjectId } } }),
                ...(teacherId && { teacher: { connect: { id: teacherId } } }),
                ...(classIds !== undefined && {
                    classes: { set: classIds.map((cid) => ({ id: cid })) },
                    classIds,
                }),
            },
            include: { subject: true, teacher: { include: { user: true } }, classes: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            await tx.assignmentSubmission.deleteMany({ where: { assignmentId: id } });
            return tx.assignment.delete({ where: { id } });
        });
    }
    async submit(assignmentId, submitDto) {
        const { studentId, answers } = submitDto;
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
        });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found.');
        const existing = await this.prisma.assignmentSubmission.findFirst({
            where: { assignmentId, studentId },
        });
        if (existing) {
            return this.prisma.assignmentSubmission.update({
                where: { id: existing.id },
                data: { answers, submittedAt: new Date(), status: 'submitted' },
            });
        }
        return this.prisma.assignmentSubmission.create({
            data: { assignmentId, studentId, answers, status: 'submitted' },
        });
    }
    async grade(submissionId, gradeDto) {
        const submission = await this.prisma.assignmentSubmission.findUnique({
            where: { id: submissionId },
        });
        if (!submission)
            throw new common_1.NotFoundException('Submission not found.');
        return this.prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: { score: gradeDto.score, feedback: gradeDto.feedback, status: 'graded' },
        });
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map