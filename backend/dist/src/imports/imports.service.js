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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const import_student_dto_1 = require("./dto/import-student.dto");
const import_teacher_dto_1 = require("./dto/import-teacher.dto");
const XLSX = __importStar(require("xlsx"));
const id_generator_service_1 = require("../common/id-generator.service");
const password_service_1 = require("../common/password.service");
const create_student_dto_1 = require("../students/dto/create-student.dto");
const STUDENT_HEADERS = {
    'student_code': 'student_code',
    'full_name': 'full_name',
    'username': 'username',
    'dob': 'dob',
    'gender': 'gender',
    'email': 'email',
    'address': 'address',
    'class_name': 'class_name',
    'guardian_name': 'guardian_name',
    'guardian_phone': 'guardian_phone',
    'guardian_birth_year': 'guardian_birth_year',
    'guardian_occupation': 'guardian_occupation',
    'guardian_citizen_id': 'guardian_citizen_id'
};
const TEACHER_HEADERS = {
    'full_name': 'full_name',
    'username': 'username',
    'start_year': 'start_year',
    'dob': 'dob',
    'gender': 'gender',
    'citizen_id': 'citizen_id',
    'email': 'email',
    'phone': 'phone',
    'address': 'address',
    'subjects': 'subjects'
};
let ImportsService = class ImportsService {
    prisma;
    idGenerator;
    passwordService;
    constructor(prisma, idGenerator, passwordService) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.passwordService = passwordService;
    }
    async importData(file, type) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        if (type !== 'students' && type !== 'teachers')
            throw new common_1.BadRequestException('Invalid import type');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        if (jsonData.length === 0)
            throw new common_1.BadRequestException('File is empty');
        const firstRow = jsonData[0];
        const headers = Object.keys(firstRow || {});
        const expectedHeaders = type === 'students' ? Object.keys(STUDENT_HEADERS) : Object.keys(TEACHER_HEADERS);
        const errors = [];
        const validData = [];
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNum = i + 2;
            const errorBase = { row: rowNum };
            if (type === 'students') {
                const dto = (0, class_transformer_1.plainToInstance)(import_student_dto_1.ImportStudentDto, row);
                if (row.dob)
                    dto.dob = this.parseDate(row.dob);
                if (row.gender)
                    dto.gender = this.parseGender(row.gender);
                const validationErrors = await (0, class_validator_1.validate)(dto);
                if (validationErrors.length > 0) {
                    validationErrors.forEach(err => {
                        errors.push({ ...errorBase, column: err.property, error: Object.values(err.constraints || {})[0] });
                    });
                    continue;
                }
                const classGroup = await this.prisma.classGroup.findUnique({ where: { name: row.class_name } });
                if (!classGroup) {
                    errors.push({ ...errorBase, column: 'class_name', error: `Class '${row.class_name}' not found` });
                }
                const existingUser = await this.prisma.user.findUnique({ where: { username: row.username } });
                if (existingUser) {
                    errors.push({ ...errorBase, column: 'username', error: `Username '${row.username}' already exists` });
                }
                if (row.email) {
                    const existingEmail = await this.prisma.user.findUnique({ where: { email: row.email } });
                    if (existingEmail) {
                        errors.push({ ...errorBase, column: 'email', error: `Email '${row.email}' already exists` });
                    }
                }
                if (errors.filter(e => e.row === rowNum).length === 0) {
                    validData.push({ ...dto, classId: classGroup?.id });
                }
            }
            else if (type === 'teachers') {
                const dto = (0, class_transformer_1.plainToInstance)(import_teacher_dto_1.ImportTeacherDto, row);
                if (row.dob)
                    dto.dob = this.parseDate(row.dob);
                if (row.gender)
                    dto.gender = this.parseGender(row.gender);
                const validationErrors = await (0, class_validator_1.validate)(dto);
                if (validationErrors.length > 0) {
                    validationErrors.forEach(err => {
                        errors.push({ ...errorBase, column: err.property, error: Object.values(err.constraints || {})[0] });
                    });
                    continue;
                }
                const existingUser = await this.prisma.user.findUnique({ where: { username: row.username } });
                if (existingUser)
                    errors.push({ ...errorBase, column: 'username', error: `Username exists` });
                const subjects = row.subjects.split(',').map((s) => s.trim());
                let departmentId = null;
                for (const subjName of subjects) {
                    const subj = await this.prisma.subject.findFirst({ where: { OR: [{ code: subjName }, { name: subjName }] } });
                    if (!subj) {
                        errors.push({ ...errorBase, column: 'subjects', error: `Subject '${subjName}' not found` });
                    }
                    else {
                        if (!departmentId)
                            departmentId = subj.department;
                    }
                }
                if (errors.filter(e => e.row === rowNum).length === 0) {
                    validData.push({ ...dto, departmentId, subjectList: subjects });
                }
            }
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException({ message: 'Validation Failed', errors });
        }
        return this.saveData(validData, type);
    }
    parseDate(val) {
        if (!val)
            return null;
        if (typeof val === 'number') {
            const date = XLSX.SSF.parse_date_code(val);
            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }
        return val;
    }
    parseGender(val) {
        const v = (val || '').toLowerCase().trim();
        if (v === 'nam' || v === 'male')
            return create_student_dto_1.Gender.Male;
        if (v === 'nữ' || v === 'female')
            return create_student_dto_1.Gender.Female;
        return create_student_dto_1.Gender.Other;
    }
    async saveData(data, type) {
        let count = 0;
        await this.prisma.$transaction(async (tx) => {
            for (const item of data) {
                const defaultPass = await this.passwordService.hashPassword('123456');
                const encryptedPass = this.passwordService.encryptPassword('123456');
                const user = await tx.user.create({
                    data: {
                        username: item.username,
                        password: defaultPass,
                        passwordEncrypted: encryptedPass,
                        name: item.full_name,
                        email: item.email || `${item.username}@school.edu`,
                        role: type === 'students' ? 'STUDENT' : 'TEACHER'
                    }
                });
                if (type === 'students') {
                    const id = item.student_code || await this.idGenerator.generateStudentId(new Date().getFullYear());
                    await tx.student.create({
                        data: {
                            id,
                            userId: user.id,
                            classId: item.classId,
                            enrollmentYear: new Date().getFullYear(),
                            dateOfBirth: new Date(item.dob),
                            gender: item.gender,
                            address: item.address,
                            guardianName: item.guardian_name,
                            guardianPhone: item.guardian_phone,
                            guardianCitizenId: item.guardian_citizen_id,
                            guardianJob: item.guardian_occupation,
                            guardianYearOfBirth: item.guardian_birth_year,
                        }
                    });
                }
                else {
                    await tx.teacher.create({
                        data: {
                            id: `GV${Math.floor(Math.random() * 10000)}`,
                            userId: user.id,
                            subjects: item.subjectList,
                            citizenId: item.citizen_id,
                            gender: item.gender,
                            phone: item.phone,
                            address: item.address,
                            joinYear: item.start_year,
                            dateOfBirth: new Date(item.dob),
                            department: item.departmentId,
                        }
                    });
                }
                count++;
            }
        });
        return { count };
    }
};
exports.ImportsService = ImportsService;
exports.ImportsService = ImportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService,
        password_service_1.PasswordService])
], ImportsService);
//# sourceMappingURL=imports.service.js.map