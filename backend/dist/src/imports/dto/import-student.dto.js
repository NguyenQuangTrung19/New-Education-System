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
exports.ImportStudentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_student_dto_1 = require("../../students/dto/create-student.dto");
class ImportStudentDto {
    student_code;
    full_name;
    username;
    dob;
    gender;
    email;
    address;
    class_name;
    guardian_name;
    guardian_phone;
    guardian_birth_year;
    guardian_occupation;
    guardian_citizen_id;
}
exports.ImportStudentDto = ImportStudentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "student_code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Full name is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "full_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Username is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 20),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Date of birth is required' }),
    __metadata("design:type", Object)
], ImportStudentDto.prototype, "dob", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Gender is required' }),
    (0, class_validator_1.IsEnum)(create_student_dto_1.Gender, { message: 'Gender must be Male, Female, or Other' }),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Class name is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "class_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Guardian name is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "guardian_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Guardian phone is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0[0-9]{9}$/, { message: 'Phone must start with 0 and have 10 digits' }),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "guardian_phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Guardian birth year must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ImportStudentDto.prototype, "guardian_birth_year", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "guardian_occupation", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Guardian Citizen ID is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(12, 12, { message: 'Citizen ID must be 12 digits' }),
    __metadata("design:type", String)
], ImportStudentDto.prototype, "guardian_citizen_id", void 0);
//# sourceMappingURL=import-student.dto.js.map