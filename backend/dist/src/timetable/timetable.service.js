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
var TimetableService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimetableService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let TimetableService = TimetableService_1 = class TimetableService {
    prisma;
    logger = new common_1.Logger(TimetableService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateSchedule() {
        this.logger.log('Gathering data for timetable generation...');
        const classes = await this.prisma.classGroup.findMany({
            select: { id: true },
        });
        const teachers = await this.prisma.teacher.findMany({
            include: {
                teachingAssignments: true,
            },
        });
        const formattedTeachers = teachers.map((t) => ({
            id: t.id,
            subjects: t.subjects,
            assignments: t.teachingAssignments.map((ta) => ({
                classId: ta.classId,
                subjectId: ta.subjectId,
                periods: ta.sessionsPerWeek,
            })),
            timeOff: [],
        }));
        this.logger.log('Validating assignment constraints...');
        const teacherLoads = {};
        const classLoads = {};
        formattedTeachers.forEach(t => {
            t.assignments.forEach(a => {
                teacherLoads[t.id] = (teacherLoads[t.id] || 0) + a.periods;
                classLoads[a.classId] = (classLoads[a.classId] || 0) + a.periods;
            });
        });
        for (const [tId, load] of Object.entries(teacherLoads)) {
            if (load > 40) {
                throw new Error(`PRE_FLIGHT_ERROR: Teacher ${tId} is assigned ${load} periods. The maximum allowed for a 5-day week is 40.`);
            }
        }
        for (const [cId, load] of Object.entries(classLoads)) {
            if (load > 40) {
                throw new Error(`PRE_FLIGHT_ERROR: Class ${cId} is assigned ${load} periods. The maximum allowed for a 5-day week is 40.`);
            }
        }
        const inputPayload = {
            weeklyStructure: {
                days: 5,
                periodsPerDay: 8,
            },
            classes: classes.map((c) => ({ id: c.id })),
            teachers: formattedTeachers,
        };
        try {
            this.logger.log('Executing OR-Tools CP-SAT model in Python child process...');
            const result = await this.runPythonScheduler(inputPayload);
            if ((result && result.status === 'OPTIMAL') ||
                result.status === 'FEASIBLE') {
                await this.saveScheduleToDatabase(result.schedule);
            }
            return result;
        }
        catch (err) {
            this.logger.error('Failed to generate timetable', err);
            throw err;
        }
    }
    runPythonScheduler(inputData) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, '..', 'common', 'scheduler_core.py');
            const pythonProcess = (0, child_process_1.spawn)('python', [scriptPath], { shell: true });
            let outputData = '';
            let errorData = '';
            pythonProcess.stdin.write(JSON.stringify(inputData));
            pythonProcess.stdin.end();
            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });
            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });
            pythonProcess.on('close', (code) => {
                const logContent = `STDOUT:\n${outputData}\n\nSTDERR:\n${errorData}\n\nCODE: ${code}`;
                fs.writeFileSync(path.join(process.cwd(), 'scheduler_debug.log'), logContent);
                this.logger.debug(`Python script stdout: ${outputData}`);
                if (errorData) {
                    this.logger.debug(`Python script stderr: ${errorData}`);
                }
                if (code !== 0) {
                    this.logger.error(`Python script exited with code ${code}`);
                    this.logger.error(`Error details: ${errorData}`);
                    reject(new Error(`Scheduler failed: ${errorData}`));
                }
                else {
                    try {
                        const cleanOutput = outputData.trim();
                        this.logger.debug(`Final Cleaned Output Length: ${cleanOutput.length}`);
                        if (!cleanOutput) {
                            return reject(new Error('Python script returned empty output'));
                        }
                        const result = JSON.parse(cleanOutput);
                        resolve(result);
                    }
                    catch (e) {
                        this.logger.error(`Parse failed on string: ${outputData.substring(0, 100)}...`);
                        reject(new Error(`Failed to parse Python script output: ${e.message}`));
                    }
                }
            });
        });
    }
    async saveScheduleToDatabase(scheduleData) {
        this.logger.log('Saving generated schedule to database...');
        return this.prisma.$transaction(async (prisma) => {
            await prisma.scheduleItem.deleteMany({});
            const daysOfWeek = [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
            ];
            const scheduleItemsToCreate = scheduleData.map((slot) => {
                const periodNumber = (slot.period % 4) + 1;
                const session = slot.period < 4 ? 'Morning' : 'Afternoon';
                return {
                    day: daysOfWeek[slot.day],
                    period: periodNumber,
                    session: session,
                    classId: slot.classId,
                    subjectId: slot.subjectId,
                    teacherId: slot.teacherId,
                };
            });
            await prisma.scheduleItem.createMany({
                data: scheduleItemsToCreate,
            });
            this.logger.log(`Successfully saved ${scheduleItemsToCreate.length} schedule items.`);
        });
    }
};
exports.TimetableService = TimetableService;
exports.TimetableService = TimetableService = TimetableService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TimetableService);
//# sourceMappingURL=timetable.service.js.map