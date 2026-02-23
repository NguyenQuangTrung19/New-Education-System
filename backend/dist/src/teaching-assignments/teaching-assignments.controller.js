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
exports.TeachingAssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const teaching_assignments_service_1 = require("./teaching-assignments.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TeachingAssignmentsController = class TeachingAssignmentsController {
    assignmentsService;
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    findAll() {
        return this.assignmentsService.findAll();
    }
    bulkSave(payload) {
        return this.assignmentsService.bulkSave(payload);
    }
};
exports.TeachingAssignmentsController = TeachingAssignmentsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TeachingAssignmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], TeachingAssignmentsController.prototype, "bulkSave", null);
exports.TeachingAssignmentsController = TeachingAssignmentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('teaching-assignments'),
    __metadata("design:paramtypes", [teaching_assignments_service_1.TeachingAssignmentsService])
], TeachingAssignmentsController);
//# sourceMappingURL=teaching-assignments.controller.js.map