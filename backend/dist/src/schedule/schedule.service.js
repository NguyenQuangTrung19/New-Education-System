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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ScheduleService = class ScheduleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createScheduleDto) {
        return this.prisma.scheduleItem.create({
            data: createScheduleDto
        });
    }
    findAll(query = {}) {
        const where = {};
        if (query.classId)
            where.classId = query.classId;
        if (query.teacherId)
            where.teacherId = query.teacherId;
        return this.prisma.scheduleItem.findMany({
            where,
            include: {
                subject: true,
                class: true,
                teacher: { include: { user: true } }
            },
            orderBy: { period: 'asc' }
        });
    }
    findOne(id) {
        return this.prisma.scheduleItem.findUnique({
            where: { id },
            include: {
                subject: true,
                class: true,
                teacher: { include: { user: true } }
            }
        });
    }
    update(id, updateScheduleDto) {
        return this.prisma.scheduleItem.update({
            where: { id },
            data: updateScheduleDto
        });
    }
    remove(id) {
        return this.prisma.scheduleItem.delete({
            where: { id }
        });
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map