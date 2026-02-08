import type { Response } from 'express';
import { ImportsService } from './imports.service';
export declare class ImportsController {
    private readonly importsService;
    constructor(importsService: ImportsService);
    uploadFile(file: Express.Multer.File, type: string): Promise<{
        count: number;
    }>;
    downloadTemplate(type: string, res: Response): Promise<void>;
}
