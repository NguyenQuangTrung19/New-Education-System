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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeachersService = class TeachersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.teacher.findMany({
            include: {
                user: { select: { name: true, email: true, avatarUrl: true } },
                classes: true,
            }
        });
    }
    async findOne(id) {
        return this.prisma.teacher.findUnique({
            where: { id },
            include: {
                user: true,
                classes: true,
                assignments: { include: { subject: true, class: true } },
            }
        });
    }
    async create(createTeacherDto) {
        const { username, password, name, email, subjects, ...teacherData } = createTeacherDto;
        const hashedPassword = password || 'teacher123';
        return this.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    name,
                    email,
                    role: 'TEACHER',
                },
            });
            const teacher = await prisma.teacher.create({
                data: {
                    id: user.id,
                    userId: user.id,
                    joinYear: teacherData.joinYear || new Date().getFullYear(),
                    address: teacherData.address,
                    phone: teacherData.phone,
                    subjects: subjects || [],
                },
            });
            return { ...teacher, user };
        });
    }
    async update(id, updateTeacherDto) {
        const { name, email, ...teacherData } = updateTeacherDto;
        if (name || email) {
            await this.prisma.user.update({
                where: { id },
                data: { name, email }
            });
        }
        return this.prisma.teacher.update({
            where: { id },
            data: teacherData,
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (prisma) => {
            await prisma.teacher.delete({ where: { id } });
            return prisma.user.delete({ where: { id } });
        });
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map