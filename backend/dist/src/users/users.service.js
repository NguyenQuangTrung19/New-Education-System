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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const password_service_1 = require("../common/password.service");
let UsersService = class UsersService {
    prisma;
    passwordService;
    constructor(prisma, passwordService) {
        this.prisma = prisma;
        this.passwordService = passwordService;
    }
    async findOne(username) {
        return this.prisma.user.findUnique({
            where: { username },
            include: {
                teacher: true,
                student: true,
            }
        });
    }
    async createUser(data) {
        const plainPassword = data.password;
        const hashedPassword = await this.passwordService.hashPassword(plainPassword);
        const encryptedPassword = this.passwordService.encryptPassword(plainPassword);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                passwordEncrypted: encryptedPassword,
            },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async updatePassword(id, password) {
        const hashedPassword = await this.passwordService.hashPassword(password);
        const encryptedPassword = this.passwordService.encryptPassword(password);
        return this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword, passwordEncrypted: encryptedPassword }
        });
    }
    async getUserCredentials(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { passwordEncrypted: true }
        });
        if (!user?.passwordEncrypted) {
            return { password: null };
        }
        const password = this.passwordService.decryptPassword(user.passwordEncrypted);
        return { password };
    }
    async verifyPassword(id, plainPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { password: true, passwordEncrypted: true }
        });
        if (!user?.password)
            return false;
        const isValid = await this.passwordService.verifyPassword(plainPassword, user.password);
        if (!isValid && !user.passwordEncrypted && user.password === plainPassword) {
            await this.updatePassword(id, plainPassword);
            return true;
        }
        return isValid;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService])
], UsersService);
//# sourceMappingURL=users.service.js.map