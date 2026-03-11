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
exports.LessonFeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LessonFeedbackService = class LessonFeedbackService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createLessonFeedbackDto) {
        return this.prisma.lessonFeedback.create({
            data: createLessonFeedbackDto,
        });
    }
    async findAllByTeacher(teacherId) {
        return this.prisma.lessonFeedback.findMany({
            where: {
                schedule: {
                    teacherId: teacherId,
                },
            },
            include: {
                schedule: true,
            },
        });
    }
    async findAllByClass(classId) {
        return this.prisma.lessonFeedback.findMany({
            where: {
                schedule: {
                    classId: classId,
                },
            },
            include: {
                schedule: true,
            },
        });
    }
    async findOne(id) {
        const feedback = await this.prisma.lessonFeedback.findUnique({
            where: { id },
        });
        if (!feedback) {
            throw new common_1.NotFoundException(`LessonFeedback with ID ${id} not found`);
        }
        return feedback;
    }
    async update(id, updateLessonFeedbackDto) {
        await this.findOne(id);
        return this.prisma.lessonFeedback.update({
            where: { id },
            data: updateLessonFeedbackDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.lessonFeedback.delete({
            where: { id },
        });
    }
};
exports.LessonFeedbackService = LessonFeedbackService;
exports.LessonFeedbackService = LessonFeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LessonFeedbackService);
//# sourceMappingURL=lesson-feedback.service.js.map