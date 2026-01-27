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
const id_generator_service_1 = require("../common/id-generator.service");
let StudentsService = class StudentsService {
    prisma;
    idGenerator;
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async findAll() {
        return this.prisma.student.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        username: true,
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
            const enrollmentYear = studentData.enrollmentYear || new Date().getFullYear();
            const studentId = await this.idGenerator.generateStudentId(enrollmentYear);
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
                    id: studentId,
                    userId: user.id,
                    classId: classId || null,
                    enrollmentYear,
                    address: studentData.address,
                    dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
                    gpa: studentData.gpa || 0.0,
                    guardianName: studentData.guardianName,
                    guardianPhone: studentData.guardianPhone,
                    guardianCitizenId: studentData.guardianCitizenId,
                    guardianJob: studentData.guardianJob,
                    guardianYearOfBirth: studentData.guardianYearOfBirth,
                },
            });
            return { ...student, user };
        });
    }
    async update(id, updateStudentDto) {
        const { name, email, username, password, user, id: _id, ...studentData } = updateStudentDto;
        if (name || email) {
            const student = await this.prisma.student.findUnique({ where: { id } });
            if (student && student.userId) {
                await this.prisma.user.update({
                    where: { id: student.userId },
                    data: {
                        name: name,
                        email: email
                    }
                });
            }
        }
        return this.prisma.student.update({
            where: { id },
            data: studentData,
        });
    }
    async remove(id) {
        const student = await this.prisma.student.findUnique({ where: { id } });
        if (!student)
            return null;
        return this.prisma.$transaction(async (prisma) => {
            await prisma.student.delete({ where: { id } });
            return prisma.user.delete({ where: { id: student.userId } });
        });
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService])
], StudentsService);
//# sourceMappingURL=students.service.js.map