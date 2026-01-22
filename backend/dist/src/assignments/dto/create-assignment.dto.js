"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAssignmentDto = exports.CreateAssignmentDto = void 0;
class CreateAssignmentDto {
    title;
    description;
    subjectId;
    teacherId;
    classIds;
    dueDate;
    duration;
    password;
    questions;
}
exports.CreateAssignmentDto = CreateAssignmentDto;
class UpdateAssignmentDto {
    title;
    description;
    dueDate;
    duration;
    password;
    questions;
    status;
}
exports.UpdateAssignmentDto = UpdateAssignmentDto;
//# sourceMappingURL=create-assignment.dto.js.map