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
  
  // Create dummy Excel for Teacher
  const headers = [
    'full_name',
    'username',
    'start_year',
    'dob',
    'gender',
    'citizen_id',
    'email',
    'phone',
    'address',
    'subjects',
  ];
  const example = [
    'Tran Thi C',
    'tranthictest1',
    '2020',
    '1990-05-05',
    'Female',
    '009876543210',
    'ctest1@school.edu',
    '0987654321',
    'Hanoi',
    'Toán',
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
    const res = await service.importData(file, 'teachers');
    console.log("Success:", res);
  } catch (error: any) {
    console.error("Import Failed:");
    console.dir(error, { depth: null });
  }
  
  process.exit(0);
}

bootstrap();
