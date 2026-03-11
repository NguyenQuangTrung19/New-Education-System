"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonFeedbackModule = void 0;
const common_1 = require("@nestjs/common");
const lesson_feedback_service_1 = require("./lesson-feedback.service");
const lesson_feedback_controller_1 = require("./lesson-feedback.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let LessonFeedbackModule = class LessonFeedbackModule {
};
exports.LessonFeedbackModule = LessonFeedbackModule;
exports.LessonFeedbackModule = LessonFeedbackModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [lesson_feedback_controller_1.LessonFeedbackController],
        providers: [lesson_feedback_service_1.LessonFeedbackService],
        exports: [lesson_feedback_service_1.LessonFeedbackService],
    })
], LessonFeedbackModule);
//# sourceMappingURL=lesson-feedback.module.js.map