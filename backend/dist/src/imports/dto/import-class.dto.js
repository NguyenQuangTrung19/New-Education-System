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
exports.ImportClassDto = void 0;
const class_validator_1 = require("class-validator");
class ImportClassDto {
    class_name;
    classroom;
    academic_year;
    homeroom_teacher;
    description;
}
exports.ImportClassDto = ImportClassDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Class name is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportClassDto.prototype, "class_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Classroom is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportClassDto.prototype, "classroom", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Academic year is required' }),
    (0, class_validator_1.Matches)(/^\d{4}-\d{4}$/, { message: 'Academic year must be in format YYYY-YYYY' }),
    __metadata("design:type", String)
], ImportClassDto.prototype, "academic_year", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportClassDto.prototype, "homeroom_teacher", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportClassDto.prototype, "description", void 0);
//# sourceMappingURL=import-class.dto.js.map