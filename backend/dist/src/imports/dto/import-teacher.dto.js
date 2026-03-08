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
exports.ImportTeacherDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_student_dto_1 = require("../../students/dto/create-student.dto");
class ImportTeacherDto {
    full_name;
    username;
    start_year;
    dob;
    gender;
    citizen_id;
    email;
    phone;
    address;
    subjects;
}
exports.ImportTeacherDto = ImportTeacherDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Full name is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportTeacherDto.prototype, "full_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Username is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 20),
    __metadata("design:type", String)
], ImportTeacherDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Start year is required' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ImportTeacherDto.prototype, "start_year", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Date of birth is required' }),
    __metadata("design:type", Object)
], ImportTeacherDto.prototype, "dob", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Gender is required' }),
    (0, class_validator_1.IsEnum)(create_student_dto_1.Gender, { message: 'Gender must be Male, Female, or Other' }),
    __metadata("design:type", String)
], ImportTeacherDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Citizen ID is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(12, 12),
    __metadata("design:type", String)
], ImportTeacherDto.prototype, "citizen_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ImportTeacherDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportTeacherDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportTeacherDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Subjects are required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportTeacherDto.prototype, "subjects", void 0);
//# sourceMappingURL=import-teacher.dto.js.map