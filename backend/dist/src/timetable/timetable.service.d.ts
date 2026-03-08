import { PrismaService } from '../prisma/prisma.service';
export declare class TimetableService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateSchedule(): Promise<any>;
    private runPythonScheduler;
    private saveScheduleToDatabase;
}
