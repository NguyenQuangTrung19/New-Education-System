"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const imports_service_1 = require("./imports.service");
const XLSX = __importStar(require("xlsx"));
let ImportsController = class ImportsController {
    importsService;
    constructor(importsService) {
        this.importsService = importsService;
    }
    async uploadFile(file, type) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        return this.importsService.importData(file, type);
    }
    async downloadTemplate(type, res) {
        if (type !== 'students' && type !== 'teachers' && type !== 'classes') {
            throw new common_1.BadRequestException('Invalid type');
        }
        let headers = [];
        let example = [];
        if (type === 'students') {
            headers = ['student_code', 'full_name', 'username', 'dob', 'gender', 'email', 'address', 'class_name', 'guardian_name', 'guardian_phone', 'guardian_birth_year', 'guardian_occupation', 'guardian_citizen_id'];
            example = ['', 'Nguyen Van A', 'nguyenvana', '2010-01-01', 'Male', 'a@example.com', 'Hanoi', '10A1', 'Nguyen Van B', '0912345678', '1980', 'Engineer', '001234567890'];
        }
        else if (type === 'teachers') {
            headers = ['full_name', 'username', 'start_year', 'dob', 'gender', 'citizen_id', 'email', 'phone', 'address', 'subjects'];
            example = ['Tran Thi C', 'tranthic', '2020', '1990-05-05', 'Female', '009876543210', 'c@school.edu', '0987654321', 'Hanoi', 'MATH,PHYS'];
        }
        else {
            headers = ['class_name', 'classroom', 'academic_year', 'homeroom_teacher', 'description'];
            example = ['10A1', 'B101', '2024-2025', 'gv.nguyenvana', 'Advanced Math Class'];
        }
        const ws = XLSX.utils.aoa_to_sheet([headers, example]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=${type}_import_template.xlsx`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.ImportsController = ImportsController;
__decorate([
    (0, common_1.Post)('upload/:type'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ImportsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('template/:type'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ImportsController.prototype, "downloadTemplate", null);
exports.ImportsController = ImportsController = __decorate([
    (0, common_1.Controller)('imports'),
    __metadata("design:paramtypes", [imports_service_1.ImportsService])
], ImportsController);
//# sourceMappingURL=imports.controller.js.map