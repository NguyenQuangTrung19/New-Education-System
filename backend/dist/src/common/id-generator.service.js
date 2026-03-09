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
    async generateStudentId(tx) {
        return this.generateId('HS', tx);
    }
    async generateTeacherId(tx) {
        return this.generateId('GV', tx);
    }
    async generateClassId(year, tx) {
        const yearPrefix = year.split('-')[0] || new Date().getFullYear().toString();
        return this.generateId(`C${yearPrefix}`, tx, 3);
    }
    async generateId(prefix, tx, padding = 4) {
        const key = prefix;
        const client = tx || this.prisma;
        let sequence = await client.idSequence.upsert({
            where: { key },
            update: { value: { increment: 1 } },
            create: { key, value: 1 },
        });
        if (sequence.value === 1) {
            let maxVal = 0;
            if (prefix === 'GV') {
                const existing = await client.teacher.findMany({
                    where: { id: { startsWith: 'GV' } },
                    select: { id: true }
                });
                const numbers = existing.map((e) => parseInt(e.id.replace('GV', '')) || 0);
                if (numbers.length > 0)
                    maxVal = Math.max(...numbers);
            }
            else if (prefix === 'HS') {
                const existing = await client.student.findMany({
                    where: { id: { startsWith: 'HS' } },
                    select: { id: true }
                });
                const numbers = existing.map((e) => parseInt(e.id.replace('HS', '')) || 0);
                if (numbers.length > 0)
                    maxVal = Math.max(...numbers);
            }
            if (maxVal >= 1) {
                sequence = await client.idSequence.update({
                    where: { key },
                    data: { value: maxVal + 1 },
                });
            }
        }
        const sequenceStr = sequence.value.toString().padStart(padding, '0');
        return `${prefix}${sequenceStr}`;
    }
};
exports.IdGeneratorService = IdGeneratorService;
exports.IdGeneratorService = IdGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdGeneratorService);
//# sourceMappingURL=id-generator.service.js.map