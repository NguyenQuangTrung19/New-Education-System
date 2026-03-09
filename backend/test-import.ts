import { Test, TestingModule } from '@nestjs/testing';
import { ImportsService } from './src/imports/imports.service';
import { PrismaService } from './src/prisma/prisma.service';
import { IdGeneratorService } from './src/common/id-generator.service';
import { PasswordService } from './src/common/password.service';
import * as XLSX from 'xlsx';

async function bootstrap() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    providers: [ImportsService, PrismaService, IdGeneratorService, PasswordService],
  }).compile();

  const service = moduleFixture.get<ImportsService>(ImportsService);
  
  // Create dummy Excel for Student
  const headers = [
    'student_code',
    'full_name',
    'username',
    'dob',
    'gender',
    'email',
    'address',
    'class_name',
    'guardian_name',
    'guardian_phone',
    'guardian_birth_year',
    'guardian_occupation',
    'guardian_citizen_id',
  ];
  const example = [
    '', // let code generate automatically
    'Student Test',
    'student.test',
    '15/05/2010',
    'Nam',
    'studenttest@school.edu',
    'Address',
    '10A1',
    'Guardian',
    '0909090909',
    '1980',
    'Job',
    '001234567890',
  ];
  
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const file = {
    buffer,
    originalname: 'test.xlsx',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  } as Express.Multer.File;

  try {
    const res = await service.importData(file, 'students');
    console.log("Success:", res);
  } catch (error: any) {
    console.error("Import Failed:");
    console.dir(error, { depth: null });
  }
  
  process.exit(0);
}

bootstrap();
