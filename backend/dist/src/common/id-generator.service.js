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
exports.IdGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IdGeneratorService = class IdGeneratorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateStudentId(enrollmentYear) {
        return this.generateId('HS', enrollmentYear);
    }
    async generateTeacherId(joinYear) {
        return this.generateId('GV', joinYear);
    }
    async generateClassId(year) {
        const yearPrefix = year.split('-')[0] || new Date().getFullYear().toString();
        return this.generateId('C', parseInt(yearPrefix));
    }
    async generateId(prefix, year) {
        const key = `${prefix}_${year}`;
        const sequence = await this.prisma.idSequence.upsert({
            where: { key },
            update: { value: { increment: 1 } },
            create: { key, value: 1 },
        });
        const sequenceStr = sequence.value.toString().padStart(3, '0');
        return `${prefix}${year}-${sequenceStr}`;
    }
};
exports.IdGeneratorService = IdGeneratorService;
exports.IdGeneratorService = IdGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdGeneratorService);
//# sourceMappingURL=id-generator.service.js.map