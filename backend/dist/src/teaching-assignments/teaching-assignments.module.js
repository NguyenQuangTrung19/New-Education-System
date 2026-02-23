"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachingAssignmentsModule = void 0;
const common_1 = require("@nestjs/common");
const teaching_assignments_controller_1 = require("./teaching-assignments.controller");
const teaching_assignments_service_1 = require("./teaching-assignments.service");
const prisma_module_1 = require("../prisma/prisma.module");
let TeachingAssignmentsModule = class TeachingAssignmentsModule {
};
exports.TeachingAssignmentsModule = TeachingAssignmentsModule;
exports.TeachingAssignmentsModule = TeachingAssignmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [teaching_assignments_controller_1.TeachingAssignmentsController],
        providers: [teaching_assignments_service_1.TeachingAssignmentsService]
    })
], TeachingAssignmentsModule);
//# sourceMappingURL=teaching-assignments.module.js.map