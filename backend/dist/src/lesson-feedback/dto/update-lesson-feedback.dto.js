"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLessonFeedbackDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_lesson_feedback_dto_1 = require("./create-lesson-feedback.dto");
class UpdateLessonFeedbackDto extends (0, mapped_types_1.PartialType)(create_lesson_feedback_dto_1.CreateLessonFeedbackDto) {
}
exports.UpdateLessonFeedbackDto = UpdateLessonFeedbackDto;
//# sourceMappingURL=update-lesson-feedback.dto.js.map