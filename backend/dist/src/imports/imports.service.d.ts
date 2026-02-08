import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';
export declare class ImportsService {
    private prisma;
    private idGenerator;
    private passwordService;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService, passwordService: PasswordService);
    importData(file: Express.Multer.File, type: string): Promise<{
        count: number;
    }>;
    private parseDate;
    private parseGender;
    private saveData;
}
