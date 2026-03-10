import type { Response } from 'express';
import { ImportsService } from './imports.service';
import { ImportBatchDto } from './dto/import-batch.dto';
export declare class ImportsController {
    private readonly importsService;
    constructor(importsService: ImportsService);
    uploadFile(file: Express.Multer.File, type: string): Promise<{
        skipped: any[];
        count: number;
        errors: {
            row: string;
            detail: string;
        }[];
    }>;
    uploadBatch(body: ImportBatchDto, type: string): Promise<{
        skipped: any[];
        batchIndex: number;
        totalBatches: number;
        count: number;
        errors: {
            row: string;
            detail: string;
        }[];
    }>;
    downloadTemplate(type: string, res: Response): Promise<void>;
}
