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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonFeedbackController = void 0;
const common_1 = require("@nestjs/common");
const lesson_feedback_service_1 = require("./lesson-feedback.service");
const create_lesson_feedback_dto_1 = require("./dto/create-lesson-feedback.dto");
const update_lesson_feedback_dto_1 = require("./dto/update-lesson-feedback.dto");
const roles_guard_1 = require("../auth/roles.guard");
const passport_1 = require("@nestjs/passport");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let LessonFeedbackController = class LessonFeedbackController {
    lessonFeedbackService;
    constructor(lessonFeedbackService) {
        this.lessonFeedbackService = lessonFeedbackService;
    }
    create(createLessonFeedbackDto) {
        return this.lessonFeedbackService.create(createLessonFeedbackDto);
    }
    findAll(teacherId, classId) {
        if (teacherId) {
            return this.lessonFeedbackService.findAllByTeacher(teacherId);
        }
        if (classId) {
            return this.lessonFeedbackService.findAllByClass(classId);
        }
        return [];
    }
    findOne(id) {
        return this.lessonFeedbackService.findOne(id);
    }
    update(id, updateLessonFeedbackDto) {
        return this.lessonFeedbackService.update(id, updateLessonFeedbackDto);
    }
    remove(id) {
        return this.lessonFeedbackService.remove(id);
    }
};
exports.LessonFeedbackController = LessonFeedbackController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lesson_feedback_dto_1.CreateLessonFeedbackDto]),
    __metadata("design:returntype", void 0)
], LessonFeedbackController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN, client_1.UserRole.STUDENT),
    __param(0, (0, common_1.Query)('teacherId')),
    __param(1, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LessonFeedbackController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN, client_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonFeedbackController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lesson_feedback_dto_1.UpdateLessonFeedbackDto]),
    __metadata("design:returntype", void 0)
], LessonFeedbackController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonFeedbackController.prototype, "remove", null);
exports.LessonFeedbackController = LessonFeedbackController = __decorate([
    (0, common_1.Controller)('lesson-feedback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [lesson_feedback_service_1.LessonFeedbackService])
], LessonFeedbackController);
//# sourceMappingURL=lesson-feedback.controller.js.map