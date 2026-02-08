
import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ImportsService } from './imports.service';
import * as XLSX from 'xlsx';

@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('upload/:type')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Param('type') type: string) {
    if (!file) throw new BadRequestException('File is required');
    return this.importsService.importData(file, type);
  }

  @Get('template/:type')
  async downloadTemplate(@Param('type') type: string, @Res() res: Response) {
      if (type !== 'students' && type !== 'teachers') {
          throw new BadRequestException('Invalid type');
      }

      // Generate Template
      let headers = [];
      let example = [];
      
      if (type === 'students') {
          headers = ['student_code', 'full_name', 'username', 'dob', 'gender', 'email', 'address', 'class_name', 'guardian_name', 'guardian_phone', 'guardian_birth_year', 'guardian_occupation', 'guardian_citizen_id'];
          example = ['', 'Nguyen Van A', 'nguyenvana', '2010-01-01', 'Male', 'a@example.com', 'Hanoi', '10A1', 'Nguyen Van B', '0912345678', '1980', 'Engineer', '001234567890'];
      } else {
          // Teachers
          headers = ['full_name', 'username', 'start_year', 'dob', 'gender', 'citizen_id', 'email', 'phone', 'address', 'subjects'];
          example = ['Tran Thi C', 'tranthic', '2020', '1990-05-05', 'Female', '009876543210', 'c@school.edu', '0987654321', 'Hanoi', 'MATH,PHYS'];
      }

      const ws = XLSX.utils.aoa_to_sheet([headers, example]);
      
      // Add comments/width (optional, skipped for brevity)
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=${type}_import_template.xlsx`,
          'Content-Length': buffer.length,
      });

      res.end(buffer);
  }
}
