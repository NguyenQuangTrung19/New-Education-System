import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';
export declare class ImportsService {
    private prisma;
    private idGenerator;
    private passwordService;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService, passwordService: PasswordService);
    importData(file: Express.Multer.File, type: string): Promise<{
        skipped: any[];
        count: number;
        errors: {
            row: string;
            detail: string;
        }[];
    }>;
    importBatch(jsonData: any[], type: string, batchIndex: number, totalBatches: number): Promise<{
        skipped: any[];
        batchIndex: number;
        totalBatches: number;
        count: number;
        errors: {
            row: string;
            detail: string;
        }[];
    }>;
    private parseDate;
    private parseGender;
    private sanitizeStringNumber;
    private saveData;
}
