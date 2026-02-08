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
const id_generator_service_1 = require("../common/id-generator.service");
const password_service_1 = require("../common/password.service");
let TeachersService = class TeachersService {
    prisma;
    idGenerator;
    passwordService;
    constructor(prisma, idGenerator, passwordService) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.passwordService = passwordService;
    }
    async findAll() {
        const teachers = await this.prisma.teacher.findMany({
            include: {
                user: { select: { name: true, email: true, avatarUrl: true, username: true } },
                classes: true,
            }
        });
        return teachers.map(teacher => {
            const { user, ...rest } = teacher;
            return {
                ...rest,
                name: user.name,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl,
            };
        });
    }
    async findOne(id) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, avatarUrl: true, username: true } },
                classes: true,
                teachingAssignments: { include: { subject: true, class: true } },
            }
        });
        if (!teacher)
            return null;
        const { user, ...rest } = teacher;
        return {
            ...rest,
            name: user.name,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
        };
    }
    async create(createTeacherDto) {
        const { username, password, name, email, subjects, ...teacherData } = createTeacherDto;
        const plainPassword = password || 'teacher123';
        const hashedPassword = await this.passwordService.hashPassword(plainPassword);
        const encryptedPassword = this.passwordService.encryptPassword(plainPassword);
        return this.prisma.$transaction(async (prisma) => {
            const joinYear = teacherData.joinYear || new Date().getFullYear();
            const teacherId = await this.idGenerator.generateTeacherId(joinYear);
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    passwordEncrypted: encryptedPassword,
                    name,
                    email,
                    role: 'TEACHER',
                },
            });
            const teacher = await prisma.teacher.create({
                data: {
                    id: teacherId,
                    userId: user.id,
                    joinYear,
                    address: teacherData.address,
                    phone: teacherData.phone,
                    citizenId: teacherData.citizenId,
                    gender: teacherData.gender || 'Male',
                    dateOfBirth: teacherData.dateOfBirth ? new Date(teacherData.dateOfBirth) : null,
                    subjects: subjects || [],
                    classesAssigned: teacherData.classesAssigned ?? 0,
                    notes: teacherData.notes ?? [],
                },
            });
            return { ...teacher, user };
        });
    }
    async update(id, updateTeacherDto) {
        const { name, email, username, password, user, id: _id, ...teacherData } = updateTeacherDto;
        if (name || email) {
            const teacher = await this.prisma.teacher.findUnique({ where: { id } });
            if (teacher && teacher.userId) {
                await this.prisma.user.update({
                    where: { id: teacher.userId },
                    data: { name, email }
                });
            }
        }
        const normalizedTeacherData = {
            ...teacherData,
            dateOfBirth: teacherData.dateOfBirth ? new Date(teacherData.dateOfBirth) : undefined,
        };
        return this.prisma.teacher.update({
            where: { id },
            data: normalizedTeacherData,
        });
    }
    async remove(id) {
        const teacher = await this.prisma.teacher.findUnique({ where: { id } });
        if (!teacher)
            return null;
        return this.prisma.$transaction(async (prisma) => {
            await prisma.classGroup.updateMany({
                where: { teacherId: id },
                data: { teacherId: null }
            });
            await prisma.scheduleItem.updateMany({
                where: { teacherId: id },
                data: { teacherId: null }
            });
            await prisma.teachingAssignment.deleteMany({
                where: { teacherId: id }
            });
            await prisma.assignment.deleteMany({
                where: { teacherId: id }
            });
            await prisma.teacher.delete({ where: { id } });
            return prisma.user.delete({ where: { id: teacher.userId } });
        });
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService,
        password_service_1.PasswordService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map