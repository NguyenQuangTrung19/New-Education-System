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
const import_class_dto_1 = require("./dto/import-class.dto");
const XLSX = __importStar(require("xlsx"));
const id_generator_service_1 = require("../common/id-generator.service");
const password_service_1 = require("../common/password.service");
const create_student_dto_1 = require("../students/dto/create-student.dto");
const STUDENT_HEADERS = {
    student_code: 'student_code',
    full_name: 'full_name',
    username: 'username',
    dob: 'dob',
    gender: 'gender',
    email: 'email',
    address: 'address',
    class_name: 'class_name',
    guardian_name: 'guardian_name',
    guardian_phone: 'guardian_phone',
    guardian_birth_year: 'guardian_birth_year',
    guardian_occupation: 'guardian_occupation',
    guardian_citizen_id: 'guardian_citizen_id',
};
const TEACHER_HEADERS = {
    full_name: 'full_name',
    username: 'username',
    start_year: 'start_year',
    dob: 'dob',
    gender: 'gender',
    citizen_id: 'citizen_id',
    email: 'email',
    phone: 'phone',
    address: 'address',
    subjects: 'subjects',
};
const CLASS_HEADERS = {
    class_name: 'class_name',
    classroom: 'classroom',
    academic_year: 'academic_year',
    homeroom_teacher: 'homeroom_teacher',
    description: 'description',
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
        if (type !== 'students' && type !== 'teachers' && type !== 'classes')
            throw new common_1.BadRequestException('Invalid import type');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        if (jsonData.length === 0)
            throw new common_1.BadRequestException('File is empty');
        const firstRow = jsonData[0];
        const headers = Object.keys(firstRow || {});
        let expectedHeaders = [];
        if (type === 'students')
            expectedHeaders = Object.keys(STUDENT_HEADERS);
        else if (type === 'teachers')
            expectedHeaders = Object.keys(TEACHER_HEADERS);
        else
            expectedHeaders = Object.keys(CLASS_HEADERS);
        const errors = [];
        const skipped = [];
        const validData = [];
        const seenUsernames = new Set();
        const seenEmails = new Set();
        const allUsers = await this.prisma.user.findMany({
            select: { username: true, email: true },
        });
        const dbUsernames = new Set(allUsers.map((u) => u.username.toLowerCase()));
        const dbEmails = new Set(allUsers.filter((u) => u.email).map((u) => u.email.toLowerCase()));
        let dbClasses = [];
        if (type === 'students' || type === 'classes') {
            dbClasses = await this.prisma.classGroup.findMany({
                select: { id: true, name: true, academicYear: true },
            });
        }
        let dbSubjects = [];
        if (type === 'teachers') {
            dbSubjects = await this.prisma.subject.findMany({
                select: { id: true, name: true, code: true, department: true },
            });
        }
        let dbTeacherUsers = [];
        if (type === 'classes') {
            dbTeacherUsers = await this.prisma.user.findMany({
                where: { role: 'TEACHER' },
                include: { teacher: true },
            });
        }
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNum = i + 2;
            const errorBase = { row: rowNum };
            if (type === 'students') {
                if (row.guardian_citizen_id !== undefined)
                    row.guardian_citizen_id = this.sanitizeStringNumber(row.guardian_citizen_id, 12);
                if (row.guardian_phone !== undefined)
                    row.guardian_phone = this.sanitizeStringNumber(row.guardian_phone, 10);
                const dto = (0, class_transformer_1.plainToInstance)(import_student_dto_1.ImportStudentDto, row);
                if (row.dob)
                    dto.dob = this.parseDate(row.dob);
                if (row.gender)
                    dto.gender = this.parseGender(row.gender);
                const validationErrors = await (0, class_validator_1.validate)(dto);
                if (validationErrors.length > 0) {
                    validationErrors.forEach((err) => {
                        errors.push({
                            ...errorBase,
                            column: err.property,
                            error: Object.values(err.constraints || {})[0],
                        });
                    });
                    continue;
                }
                const classNameLower = row.class_name?.toString().toLowerCase();
                const classGroup = dbClasses.find(c => c.name.toLowerCase() === classNameLower);
                if (!classGroup) {
                    errors.push({
                        ...errorBase,
                        column: 'class_name',
                        error: `Class '${row.class_name}' not found`,
                    });
                }
                const usernameLower = row.username?.toString().toLowerCase();
                if (usernameLower) {
                    if (seenUsernames.has(usernameLower)) {
                        skipped.push({
                            ...errorBase,
                            column: 'username',
                            reason: `Username '${row.username}' trùng trong file, đã bỏ qua`,
                        });
                        continue;
                    }
                    else if (dbUsernames.has(usernameLower)) {
                        skipped.push({
                            ...errorBase,
                            column: 'username',
                            reason: `Username '${row.username}' đã tồn tại trong hệ thống, đã bỏ qua`,
                        });
                        continue;
                    }
                    else {
                        seenUsernames.add(usernameLower);
                    }
                }
                const emailLower = row.email?.toString().toLowerCase();
                if (emailLower) {
                    if (seenEmails.has(emailLower)) {
                        skipped.push({
                            ...errorBase,
                            column: 'email',
                            reason: `Email '${row.email}' trùng trong file, đã bỏ qua`,
                        });
                        continue;
                    }
                    else if (dbEmails.has(emailLower)) {
                        skipped.push({
                            ...errorBase,
                            column: 'email',
                            reason: `Email '${row.email}' đã tồn tại trong hệ thống, đã bỏ qua`,
                        });
                        continue;
                    }
                    else {
                        seenEmails.add(emailLower);
                    }
                }
                if (errors.filter((e) => e.row === rowNum).length === 0) {
                    validData.push({ ...dto, classId: classGroup?.id });
                }
            }
            else if (type === 'teachers') {
                if (row.citizen_id !== undefined)
                    row.citizen_id = this.sanitizeStringNumber(row.citizen_id, 12);
                if (row.phone !== undefined)
                    row.phone = this.sanitizeStringNumber(row.phone, 10);
                const dto = (0, class_transformer_1.plainToInstance)(import_teacher_dto_1.ImportTeacherDto, row);
                if (row.dob)
                    dto.dob = this.parseDate(row.dob);
                if (row.gender)
                    dto.gender = this.parseGender(row.gender);
                const validationErrors = await (0, class_validator_1.validate)(dto);
                if (validationErrors.length > 0) {
                    validationErrors.forEach((err) => {
                        errors.push({
                            ...errorBase,
                            column: err.property,
                            error: Object.values(err.constraints || {})[0],
                        });
                    });
                    continue;
                }
                const usernameLower = row.username?.toString().toLowerCase();
                if (usernameLower) {
                    if (seenUsernames.has(usernameLower)) {
                        skipped.push({
                            ...errorBase,
                            column: 'username',
                            reason: `Username '${row.username}' trùng trong file, đã bỏ qua`,
                        });
                        continue;
                    }
                    else if (dbUsernames.has(usernameLower)) {
                        skipped.push({
                            ...errorBase,
                            column: 'username',
                            reason: `Username '${row.username}' đã tồn tại trong hệ thống, đã bỏ qua`,
                        });
                        continue;
                    }
                    else {
                        seenUsernames.add(usernameLower);
                    }
                }
                const emailLower = row.email?.toString().toLowerCase();
                if (emailLower) {
                    if (seenEmails.has(emailLower)) {
                        skipped.push({
                            ...errorBase,
                            column: 'email',
                            reason: `Email '${row.email}' trùng trong file, đã bỏ qua`,
                        });
                        continue;
                    }
                    else if (dbEmails.has(emailLower)) {
                        skipped.push({
                            ...errorBase,
                            column: 'email',
                            reason: `Email '${row.email}' đã tồn tại trong hệ thống, đã bỏ qua`,
                        });
                        continue;
                    }
                    else {
                        seenEmails.add(emailLower);
                    }
                }
                const subjects = row.subjects
                    .split(',')
                    .map((s) => s.trim());
                let departmentId = null;
                let normalizedSubjects = [];
                for (const subjName of subjects) {
                    const subjNameLower = subjName.toLowerCase();
                    const subj = dbSubjects.find(s => s.code.toLowerCase() === subjNameLower || s.name.toLowerCase() === subjNameLower);
                    if (!subj) {
                        errors.push({
                            ...errorBase,
                            column: 'subjects',
                            error: `Subject '${subjName}' not found`,
                        });
                    }
                    else {
                        normalizedSubjects.push(subj.name);
                        if (!departmentId)
                            departmentId = subj.department;
                    }
                }
                if (errors.filter((e) => e.row === rowNum).length === 0) {
                    validData.push({ ...dto, departmentId, subjectList: normalizedSubjects });
                }
            }
            else if (type === 'classes') {
                const dto = (0, class_transformer_1.plainToInstance)(import_class_dto_1.ImportClassDto, row);
                const validationErrors = await (0, class_validator_1.validate)(dto);
                if (validationErrors.length > 0) {
                    validationErrors.forEach((err) => {
                        errors.push({
                            ...errorBase,
                            column: err.property,
                            error: Object.values(err.constraints || {})[0],
                        });
                    });
                    continue;
                }
                let teacherId = null;
                if (row.homeroom_teacher) {
                    const teacherUsernameLower = row.homeroom_teacher.toString().toLowerCase();
                    const teacher = dbTeacherUsers.find(t => t.username.toLowerCase() === teacherUsernameLower);
                    if (!teacher || teacher.role !== 'TEACHER' || !teacher.teacher) {
                        errors.push({
                            ...errorBase,
                            column: 'homeroom_teacher',
                            error: `Teacher username '${row.homeroom_teacher}' not found or invalid`,
                        });
                    }
                    else {
                        teacherId = teacher.teacher.id;
                    }
                }
                const classNameLower = row.class_name?.toString().toLowerCase();
                const existingClass = dbClasses.find(c => c.name.toLowerCase() === classNameLower && c.academicYear === row.academic_year);
                if (existingClass) {
                    errors.push({
                        ...errorBase,
                        column: 'class_name',
                        error: `Class '${row.class_name}' already exists in year ${row.academic_year}`,
                    });
                }
                const match = row.class_name.match(/^(\d+)/);
                const gradeLevel = match ? parseInt(match[1], 10) : 10;
                if (errors.filter((e) => e.row === rowNum).length === 0) {
                    validData.push({ ...dto, teacherId, gradeLevel });
                }
            }
        }
        if (errors.length > 0 && validData.length === 0) {
            throw new common_1.BadRequestException({ message: 'Validation Failed', errors });
        }
        const result = await this.saveData(validData, type);
        return { ...result, skipped };
    }
    async importBatch(jsonData, type, batchIndex, totalBatches) {
        if (type !== 'students' && type !== 'teachers' && type !== 'classes')
            throw new common_1.BadRequestException('Invalid import type');
        if (jsonData.length === 0)
            throw new common_1.BadRequestException('Batch data is empty');
        const errors = [];
        const skipped = [];
        const validData = [];
        const seenUsernames = new Set();
        const seenEmails = new Set();
        const allUsers = await this.prisma.user.findMany({
            select: { username: true, email: true },
        });
        const dbUsernames = new Set(allUsers.map((u) => u.username.toLowerCase()));
        const dbEmails = new Set(allUsers.filter((u) => u.email).map((u) => u.email.toLowerCase()));
        let dbClasses = [];
        if (type === 'students' || type === 'classes') {
            dbClasses = await this.prisma.classGroup.findMany({
                select: { id: true, name: true, academicYear: true },
            });
        }
        let dbSubjects = [];
        if (type === 'teachers') {
            dbSubjects = await this.prisma.subject.findMany({
                select: { id: true, name: true, code: true, department: true },
            });
        }
        let dbTeacherUsers = [];
        if (type === 'classes') {
            dbTeacherUsers = await this.prisma.user.findMany({
                where: { role: 'TEACHER' },
                include: { teacher: true },
            });
        }
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNum = (batchIndex * jsonData.length) + i + 2;
            const errorBase = { row: rowNum };
            if (type === 'students') {
                if (row.guardian_citizen_id !== undefined)
                    row.guardian_citizen_id = this.sanitizeStringNumber(row.guardian_citizen_id, 12);
                if (row.guardian_phone !== undefined)
                    row.guardian_phone = this.sanitizeStringNumber(row.guardian_phone, 10);
                const dto = (0, class_transformer_1.plainToInstance)(import_student_dto_1.ImportStudentDto, row);
                if (row.dob)
                    dto.dob = this.parseDate(row.dob);
                if (row.gender)
                    dto.gender = this.parseGender(row.gender);
                const validationErrors = await (0, class_validator_1.validate)(dto);
                if (validationErrors.length > 0) {
                    validationErrors.forEach((err) => {
                        errors.push({
                            ...errorBase,
                            column: err.property,
                            error: Object.values(err.constraints || {})[0],
                        });
                    });
                    continue;
                }
                const classNameLower = row.class_name?.toString().toLowerCase();
                const classGroup = dbClasses.find(c => c.name.toLowerCase() === classNameLower);
                if (!classGroup) {
                    errors.push({ ...errorBase, column: 'class_name', error: `Class '${row.class_name}' not found` });
                }
                const usernameLower = row.username?.toString().toLowerCase();
                if (usernameLower) {
                    if (seenUsernames.has(usernameLower)) {
                        skipped.push({ ...errorBase, column: 'username', reason: `Username '${row.username}' trùng trong batch, đã bỏ qua` });
                        continue;
                    }
                    else if (dbUsernames.has(usernameLower)) {
                        skipped.push({ ...errorBase, column: 'username', reason: `Username '${row.username}' đã tồn tại trong hệ thống, đã bỏ qua` });
                        continue;
                    }
                    else {
                        seenUsernames.add(usernameLower);
                    }
                }
                const emailLower = row.email?.toString().toLowerCase();
                if (emailLower) {
                    if (seenEmails.has(emailLower)) {
                        skipped.push({ ...errorBase, column: 'email', reason: `Email '${row.email}' trùng trong batch, đã bỏ qua` });
                        continue;
                    }
                    else if (dbEmails.has(emailLower)) {
                        skipped.push({ ...errorBase, column: 'email', reason: `Email '${row.email}' đã tồn tại trong hệ thống, đã bỏ qua` });
                        continue;
                    }
                    else {
                        seenEmails.add(emailLower);
                    }
                }
                if (errors.filter((e) => e.row === rowNum).length === 0) {
                    validData.push({ ...dto, classId: classGroup?.id });
                }
            }
            else if (type === 'teachers') {
                if (row.citizen_id !== undefined)
                    row.citizen_id = this.sanitizeStringNumber(row.citizen_id, 12);
                if (row.phone !== undefined)
                    row.phone = this.sanitizeStringNumber(row.phone, 10);
                const dto = (0, class_transformer_1.plainToInstance)(import_teacher_dto_1.ImportTeacherDto, row);
                if (row.dob)
                    dto.dob = this.parseDate(row.dob);
                if (row.gender)
                    dto.gender = this.parseGender(row.gender);
                const validationErrors = await (0, class_validator_1.validate)(dto);
                if (validationErrors.length > 0) {
                    validationErrors.forEach((err) => {
                        errors.push({
                            ...errorBase,
                            column: err.property,
                            error: Object.values(err.constraints || {})[0],
                        });
                    });
                    continue;
                }
                const usernameLower = row.username?.toString().toLowerCase();
                if (usernameLower) {
                    if (seenUsernames.has(usernameLower)) {
                        skipped.push({ ...errorBase, column: 'username', reason: `Username '${row.username}' trùng trong batch, đã bỏ qua` });
                        continue;
                    }
                    else if (dbUsernames.has(usernameLower)) {
                        skipped.push({ ...errorBase, column: 'username', reason: `Username '${row.username}' đã tồn tại trong hệ thống, đã bỏ qua` });
                        continue;
                    }
                    else {
                        seenUsernames.add(usernameLower);
                    }
                }
                const emailLower = row.email?.toString().toLowerCase();
                if (emailLower) {
                    if (seenEmails.has(emailLower)) {
                        skipped.push({ ...errorBase, column: 'email', reason: `Email '${row.email}' trùng trong batch, đã bỏ qua` });
                        continue;
                    }
                    else if (dbEmails.has(emailLower)) {
                        skipped.push({ ...errorBase, column: 'email', reason: `Email '${row.email}' đã tồn tại trong hệ thống, đã bỏ qua` });
                        continue;
                    }
                    else {
                        seenEmails.add(emailLower);
                    }
                }
                const subjects = row.subjects.split(',').map((s) => s.trim());
                let departmentId = null;
                let normalizedSubjects = [];
                for (const subjName of subjects) {
                    const subjNameLower = subjName.toLowerCase();
                    const subj = dbSubjects.find(s => s.code.toLowerCase() === subjNameLower || s.name.toLowerCase() === subjNameLower);
                    if (!subj) {
                        errors.push({ ...errorBase, column: 'subjects', error: `Subject '${subjName}' not found` });
                    }
                    else {
                        normalizedSubjects.push(subj.name);
                        if (!departmentId)
                            departmentId = subj.department;
                    }
                }
                if (errors.filter((e) => e.row === rowNum).length === 0) {
                    validData.push({ ...dto, departmentId, subjectList: normalizedSubjects });
                }
            }
            else if (type === 'classes') {
                const dto = (0, class_transformer_1.plainToInstance)(import_class_dto_1.ImportClassDto, row);
                const validationErrors = await (0, class_validator_1.validate)(dto);
                if (validationErrors.length > 0) {
                    validationErrors.forEach((err) => {
                        errors.push({
                            ...errorBase,
                            column: err.property,
                            error: Object.values(err.constraints || {})[0],
                        });
                    });
                    continue;
                }
                let teacherId = null;
                if (row.homeroom_teacher) {
                    const teacherUsernameLower = row.homeroom_teacher.toString().toLowerCase();
                    const teacher = dbTeacherUsers.find(t => t.username.toLowerCase() === teacherUsernameLower);
                    if (!teacher || teacher.role !== 'TEACHER' || !teacher.teacher) {
                        errors.push({ ...errorBase, column: 'homeroom_teacher', error: `Teacher username '${row.homeroom_teacher}' not found or invalid` });
                    }
                    else {
                        teacherId = teacher.teacher.id;
                    }
                }
                const classNameLower = row.class_name?.toString().toLowerCase();
                const existingClass = dbClasses.find(c => c.name.toLowerCase() === classNameLower && c.academicYear === row.academic_year);
                if (existingClass) {
                    errors.push({ ...errorBase, column: 'class_name', error: `Class '${row.class_name}' already exists in year ${row.academic_year}` });
                }
                const match = row.class_name.match(/^(\d+)/);
                const gradeLevel = match ? parseInt(match[1], 10) : 10;
                if (errors.filter((e) => e.row === rowNum).length === 0) {
                    validData.push({ ...dto, teacherId, gradeLevel });
                }
            }
        }
        if (errors.length > 0 && validData.length === 0) {
            throw new common_1.BadRequestException({ message: 'Validation Failed', errors });
        }
        const result = await this.saveData(validData, type);
        return {
            ...result,
            skipped,
            batchIndex,
            totalBatches,
        };
    }
    parseDate(val) {
        if (!val)
            return null;
        if (typeof val === 'number') {
            const date = XLSX.SSF.parse_date_code(val);
            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }
        const strVal = String(val).trim();
        if (strVal.includes('/')) {
            const parts = strVal.split('/');
            if (parts.length === 3) {
                const [d, m, y] = parts;
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
        }
        else if (strVal.includes('-')) {
            const parts = strVal.split('-');
            if (parts.length === 3 && parts[0].length === 2) {
                const [d, m, y] = parts;
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
        }
        return strVal;
    }
    parseGender(val) {
        if (!val)
            return null;
        const str = String(val).toLowerCase().trim();
        if (str === 'male' || str === 'nam')
            return create_student_dto_1.Gender.Male;
        if (str === 'female' || str === 'nữ')
            return create_student_dto_1.Gender.Female;
        return create_student_dto_1.Gender.Other;
    }
    sanitizeStringNumber(val, targetLength) {
        if (val === undefined || val === null)
            return '';
        let str = String(val).trim();
        if (str.startsWith("'")) {
            str = str.substring(1);
        }
        if (typeof val === 'number') {
            const numStr = val.toLocaleString('fullwide', { useGrouping: false });
            if (numStr && numStr !== 'NaN') {
                str = numStr;
            }
        }
        if (/^\d+$/.test(str)) {
            while (str.length < targetLength) {
                str = '0' + str;
            }
        }
        return str;
    }
    async saveData(data, type) {
        let count = 0;
        let defaultPass = '';
        if (type !== 'classes') {
            defaultPass = await this.passwordService.hashPassword('123456');
        }
        const responseErrors = [];
        const CHUNK_SIZE = 10;
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (item) => {
                if (type === 'classes') {
                    try {
                        const id = await this.idGenerator.generateClassId(item.academic_year);
                        await this.prisma.classGroup.create({
                            data: {
                                id,
                                name: item.class_name,
                                gradeLevel: item.gradeLevel,
                                room: item.classroom,
                                academicYear: item.academic_year,
                                description: item.description,
                                teacherId: item.teacherId,
                            },
                        });
                        count++;
                    }
                    catch (err) {
                        responseErrors.push({ row: item.class_name, detail: err.message });
                    }
                }
                else {
                    try {
                        let generatedId = '';
                        if (type === 'students' && !item.student_code) {
                            generatedId = await this.idGenerator.generateStudentId();
                        }
                        else if (type === 'teachers') {
                            generatedId = await this.idGenerator.generateTeacherId();
                        }
                        await this.prisma.$transaction(async (tx) => {
                            const user = await tx.user.create({
                                data: {
                                    username: item.username,
                                    password: defaultPass,
                                    name: item.full_name,
                                    email: item.email || `${item.username}@school.edu`,
                                    role: type === 'students' ? 'STUDENT' : 'TEACHER',
                                },
                            });
                            if (type === 'students') {
                                const id = item.student_code || generatedId;
                                console.log('DEBUG_IMPORT_ITEM:', JSON.stringify(item));
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
                                        guardianYearOfBirth: item.guardian_birth_year ? parseInt(item.guardian_birth_year, 10) : null,
                                    },
                                });
                            }
                            else if (type === 'teachers') {
                                const id = generatedId;
                                await tx.teacher.create({
                                    data: {
                                        id,
                                        userId: user.id,
                                        subjects: item.subjectList,
                                        citizenId: item.citizen_id,
                                        gender: item.gender,
                                        phone: item.phone,
                                        address: item.address,
                                        joinYear: item.start_year,
                                        dateOfBirth: new Date(item.dob),
                                        department: item.departmentId,
                                    },
                                });
                            }
                        }, {
                            timeout: 10000
                        });
                        count++;
                    }
                    catch (err) {
                        responseErrors.push({ row: item.username || item.full_name, detail: err?.meta || err.message || String(err) });
                    }
                }
            }));
        }
        if (responseErrors.length > 0 && count === 0) {
            throw new common_1.BadRequestException({ message: 'Lỗi khi lưu dữ liệu vào hệ thống. Không có dòng nào được import.', details: responseErrors });
        }
        return { count, errors: responseErrors };
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