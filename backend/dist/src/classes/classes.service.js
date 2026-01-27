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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../common/id-generator.service");
let ClassesService = class ClassesService {
    prisma;
    idGenerator;
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async findAll() {
        return this.prisma.classGroup.findMany({
            include: {
                teacher: {
                    include: { user: { select: { name: true } } }
                },
                _count: {
                    select: { students: true }
                }
            }
        });
    }
    async findOne(id) {
        return this.prisma.classGroup.findUnique({
            where: { id },
            include: {
                teacher: { include: { user: true } },
                students: { include: { user: true } },
                scheduleItems: {
                    include: { subject: true, teacher: { include: { user: true } } }
                },
                teachingAssignments: {
                    include: { subject: true, teacher: { include: { user: true } } }
                }
            }
        });
    }
    async create(createClassDto) {
        const { academicYear, ...classData } = createClassDto;
        const year = academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
        const classId = await this.idGenerator.generateClassId(year);
        return this.prisma.classGroup.create({
            data: {
                id: classId,
                academicYear: year,
                ...classData
            }
        });
    }
    async update(id, updateClassDto) {
        return this.prisma.classGroup.update({
            where: { id },
            data: updateClassDto
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (prisma) => {
            await prisma.student.updateMany({
                where: { classId: id },
                data: { classId: null }
            });
            await prisma.scheduleItem.deleteMany({
                where: { classId: id }
            });
            await prisma.teachingAssignment.deleteMany({
                where: { classId: id }
            });
            return prisma.classGroup.delete({
                where: { id }
            });
        });
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map