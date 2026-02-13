"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
let PasswordService = class PasswordService {
    getEncryptionKey() {
        const rawKey = process.env.PASSWORD_ENCRYPTION_KEY;
        if (!rawKey) {
            throw new Error('PASSWORD_ENCRYPTION_KEY is required');
        }
        const key = Buffer.from(rawKey, 'base64');
        if (key.length !== 32) {
            throw new Error('PASSWORD_ENCRYPTION_KEY must be 32 bytes (base64)');
        }
        return key;
    }
    async hashPassword(plain) {
        return bcryptjs_1.default.hash(plain, 10);
    }
    async verifyPassword(plain, hash) {
        return bcryptjs_1.default.compare(plain, hash);
    }
    encryptPassword(plain) {
        const key = this.getEncryptionKey();
        const iv = (0, crypto_1.randomBytes)(12);
        const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return [iv, tag, encrypted].map((part) => part.toString('base64')).join('.');
    }
    decryptPassword(payload) {
        const key = this.getEncryptionKey();
        const [ivB64, tagB64, dataB64] = payload.split('.');
        if (!ivB64 || !tagB64 || !dataB64) {
            throw new Error('Invalid encrypted password format');
        }
        const iv = Buffer.from(ivB64, 'base64');
        const tag = Buffer.from(tagB64, 'base64');
        const data = Buffer.from(dataB64, 'base64');
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
        return decrypted.toString('utf8');
    }
};
exports.PasswordService = PasswordService;
exports.PasswordService = PasswordService = __decorate([
    (0, common_1.Injectable)()
], PasswordService);
//# sourceMappingURL=password.service.js.map