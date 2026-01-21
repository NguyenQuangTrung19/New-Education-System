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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentsService = class StudentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.student.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatarUrl: true,
                    }
                },
                class: true,
            }
        });
    }
    async findOne(id) {
        return this.prisma.student.findUnique({
            where: { id },
            include: {
                user: true,
                class: true,
                academicHistory: true,
                grades: {
                    include: { subject: true }
                },
                attendance: true,
                tuitions: true,
            }
        });
    }
    async create(createStudentDto) {
        const { username, password, name, email, classId, ...studentData } = createStudentDto;
        const hashedPassword = password || 'student123';
        return this.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    name,
                    email,
                    role: 'STUDENT',
                },
            });
            const student = await prisma.student.create({
                data: {
                    id: user.id,
                    userId: user.id,
                    classId: classId || null,
                    enrollmentYear: studentData.enrollmentYear || new Date().getFullYear(),
                    address: studentData.address,
                    guardianName: studentData.guardianName,
                    guardianPhone: studentData.guardianPhone,
                },
            });
            return { ...student, user };
        });
    }
    async update(id, updateStudentDto) {
        const { name, email, ...studentData } = updateStudentDto;
        if (name || email) {
            await this.prisma.user.update({
                where: { id },
                data: {
                    name: name,
                    email: email
                }
            });
        }
        return this.prisma.student.update({
            where: { id },
            data: studentData,
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (prisma) => {
            await prisma.student.delete({ where: { id } });
            return prisma.user.delete({ where: { id } });
        });
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map