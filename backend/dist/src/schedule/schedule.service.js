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
            data: createScheduleDto,
        });
    }
    async findByWeek(weekStartDate, query = {}) {
        const weekDate = new Date(weekStartDate);
        weekDate.setUTCHours(0, 0, 0, 0);
        const where = {};
        if (query.classId)
            where.classId = query.classId;
        if (query.teacherId)
            where.teacherId = query.teacherId;
        const includeRelations = {
            subject: true,
            class: true,
            teacher: { include: { user: true } },
        };
        const [weekItems, baseItems] = await Promise.all([
            this.prisma.scheduleItem.findMany({
                where: { ...where, weekStartDate: weekDate },
                include: includeRelations,
                orderBy: { period: 'asc' },
            }),
            this.prisma.scheduleItem.findMany({
                where: { ...where, weekStartDate: null },
                include: includeRelations,
                orderBy: { period: 'asc' },
            }),
        ]);
        const weekItemKeys = new Set(weekItems.map(item => `${item.day}|${item.period}|${item.session}|${item.classId}`));
        const mergedItems = [
            ...weekItems.map(item => ({ ...item, isBase: false })),
            ...baseItems
                .filter(item => !weekItemKeys.has(`${item.day}|${item.period}|${item.session}|${item.classId}`))
                .map(item => ({ ...item, isBase: true })),
        ];
        return mergedItems;
    }
    findAll(query = {}) {
        const where = {};
        if (query.classId)
            where.classId = query.classId;
        if (query.teacherId)
            where.teacherId = query.teacherId;
        if (!query.weekStartDate) {
            where.weekStartDate = null;
        }
        return this.prisma.scheduleItem.findMany({
            where,
            include: {
                subject: true,
                class: true,
                teacher: { include: { user: true } },
            },
            orderBy: { period: 'asc' },
        });
    }
    findOne(id) {
        return this.prisma.scheduleItem.findUnique({
            where: { id },
            include: {
                subject: true,
                class: true,
                teacher: { include: { user: true } },
            },
        });
    }
    async update(id, updateScheduleDto) {
        const existingItem = await this.prisma.scheduleItem.findUnique({
            where: { id },
        });
        if (!existingItem) {
            throw new Error('Schedule item not found');
        }
        if (existingItem.weekStartDate === null && updateScheduleDto.weekStartDate) {
            const targetWeekDate = new Date(updateScheduleDto.weekStartDate);
            targetWeekDate.setUTCHours(0, 0, 0, 0);
            const newItem = await this.prisma.scheduleItem.create({
                data: {
                    day: updateScheduleDto.day ?? existingItem.day,
                    period: updateScheduleDto.period ?? existingItem.period,
                    session: updateScheduleDto.session ?? existingItem.session,
                    room: updateScheduleDto.room ?? existingItem.room,
                    subjectId: updateScheduleDto.subjectId ?? existingItem.subjectId,
                    classId: updateScheduleDto.classId ?? existingItem.classId,
                    teacherId: updateScheduleDto.teacherId ?? existingItem.teacherId,
                    weekStartDate: targetWeekDate,
                },
                include: {
                    subject: true,
                    class: true,
                    teacher: { include: { user: true } },
                },
            });
            return { ...newItem, isBase: false, _copyOnWrite: true };
        }
        const { weekStartDate, ...updateData } = updateScheduleDto;
        return this.prisma.scheduleItem.update({
            where: { id },
            data: updateData,
            include: {
                subject: true,
                class: true,
                teacher: { include: { user: true } },
            },
        });
    }
    remove(id) {
        return this.prisma.scheduleItem.delete({
            where: { id },
        });
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map