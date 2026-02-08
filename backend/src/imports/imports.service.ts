
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ImportStudentDto } from './dto/import-student.dto';
import { ImportTeacherDto } from './dto/import-teacher.dto';
import * as XLSX from 'xlsx';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';
import { Gender } from '../students/dto/create-student.dto';

const STUDENT_HEADERS = {
  'student_code': 'student_code',
  'full_name': 'full_name',
  'username': 'username',
  'dob': 'dob',
  'gender': 'gender',
  'email': 'email',
  'address': 'address',
  'class_name': 'class_name',
  'guardian_name': 'guardian_name',
  'guardian_phone': 'guardian_phone',
  'guardian_birth_year': 'guardian_birth_year',
  'guardian_occupation': 'guardian_occupation',
  'guardian_citizen_id': 'guardian_citizen_id'
};

const TEACHER_HEADERS = {
  'full_name': 'full_name',
  'username': 'username',
  'start_year': 'start_year',
  'dob': 'dob',
  'gender': 'gender',
  'citizen_id': 'citizen_id',
  'email': 'email',
  'phone': 'phone',
  'address': 'address',
  'subjects': 'subjects'
};

@Injectable()
export class ImportsService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private passwordService: PasswordService
  ) {}

  async importData(file: Express.Multer.File, type: string) {
    if (!file) throw new BadRequestException('No file provided');
    if (type !== 'students' && type !== 'teachers') throw new BadRequestException('Invalid import type');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (jsonData.length === 0) throw new BadRequestException('File is empty');

    // 1. Validate Headers
    const firstRow = jsonData[0] as object;
    const headers = Object.keys(firstRow || {});
    const expectedHeaders = type === 'students' ? Object.keys(STUDENT_HEADERS) : Object.keys(TEACHER_HEADERS);
    
    const errors: any[] = [];
    const validData: any[] = [];

    // Parse and Validate Rows
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNum = i + 2; // Row 1 is header

      const errorBase = { row: rowNum };

      if (type === 'students') {
        const dto = plainToInstance(ImportStudentDto, row);
        
        if (row.dob) dto.dob = this.parseDate(row.dob);
        if (row.gender) dto.gender = this.parseGender(row.gender);

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
          validationErrors.forEach(err => {
            errors.push({ ...errorBase, column: err.property, error: Object.values(err.constraints || {})[0] });
          });
          continue; 
        }
        
        const classGroup = await this.prisma.classGroup.findUnique({ where: { name: row.class_name } });
        if (!classGroup) {
          errors.push({ ...errorBase, column: 'class_name', error: `Class '${row.class_name}' not found` });
        }

        const existingUser = await this.prisma.user.findUnique({ where: { username: row.username } });
        if (existingUser) {
           errors.push({ ...errorBase, column: 'username', error: `Username '${row.username}' already exists` });
        }
        
        if (row.email) {
            const existingEmail = await this.prisma.user.findUnique({ where: { email: row.email } });
            if (existingEmail) {
                errors.push({ ...errorBase, column: 'email', error: `Email '${row.email}' already exists` });
            }
        }

        if (errors.filter(e => e.row === rowNum).length === 0) {
           validData.push({ ...dto, classId: classGroup?.id });
        }

      } else if (type === 'teachers') {
         const dto = plainToInstance(ImportTeacherDto, row);
         if (row.dob) dto.dob = this.parseDate(row.dob);
         if (row.gender) dto.gender = this.parseGender(row.gender);

         const validationErrors = await validate(dto);
         if (validationErrors.length > 0) {
            validationErrors.forEach(err => {
                errors.push({ ...errorBase, column: err.property, error: Object.values(err.constraints || {})[0] });
            });
            continue;
         }

         const existingUser = await this.prisma.user.findUnique({ where: { username: row.username } });
         if (existingUser) errors.push({ ...errorBase, column: 'username', error: `Username exists` });

         const subjects = (row.subjects as string).split(',').map((s: string) => s.trim());
         let departmentId = null;
         for (const subjName of subjects) {
             const subj = await this.prisma.subject.findFirst({ where: { OR: [{ code: subjName }, { name: subjName }] } });
             if (!subj) {
                 errors.push({ ...errorBase, column: 'subjects', error: `Subject '${subjName}' not found` });
             } else {
                 if (!departmentId) departmentId = subj.department; 
             }
         }
         
         if (errors.filter(e => e.row === rowNum).length === 0) {
            validData.push({ ...dto, departmentId, subjectList: subjects });
         }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({ message: 'Validation Failed', errors });
    }

    return this.saveData(validData, type);
  }

  private parseDate(val: any): string | null {
      if (!val) return null;
      if (typeof val === 'number') {
          const date = XLSX.SSF.parse_date_code(val);
          return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
      return val; 
  }

  private parseGender(val: string): Gender {
      const v = (val || '').toLowerCase().trim();
      if (v === 'nam' || v === 'male') return Gender.Male;
      if (v === 'nữ' || v === 'female') return Gender.Female;
      return Gender.Other;
  }

  private async saveData(data: any[], type: string) {
      let count = 0;
      await this.prisma.$transaction(async (tx) => {
          for (const item of data) {
              const defaultPass = await this.passwordService.hashPassword('123456');
              const encryptedPass = this.passwordService.encryptPassword('123456');

              const user = await tx.user.create({
                  data: {
                      username: item.username,
                      password: defaultPass,
                      passwordEncrypted: encryptedPass,
                      name: item.full_name,
                      email: item.email || `${item.username}@school.edu`, 
                      role: type === 'students' ? 'STUDENT' : 'TEACHER'
                  }
              });

              if (type === 'students') {
                  const id = item.student_code || await this.idGenerator.generateStudentId(new Date().getFullYear());
                  // @ts-ignore: gender field might not be in generated type yet
                  await tx.student.create({
                      data: {
                          id,
                          userId: user.id,
                          classId: item.classId,
                          enrollmentYear: new Date().getFullYear(),
                          dateOfBirth: new Date(item.dob),
                          gender: item.gender as any,
                          address: item.address,
                          guardianName: item.guardian_name,
                          guardianPhone: item.guardian_phone,
                          guardianCitizenId: item.guardian_citizen_id,
                          guardianJob: item.guardian_occupation,
                          guardianYearOfBirth: item.guardian_birth_year,
                      }
                  });
              } else {
                  await tx.teacher.create({
                      data: {
                          id: `GV${Math.floor(Math.random() * 10000)}`, 
                          userId: user.id,
                          subjects: item.subjectList,
                          citizenId: item.citizen_id,
                          gender: item.gender as any, 
                          phone: item.phone,
                          address: item.address,
                          joinYear: item.start_year,
                          dateOfBirth: new Date(item.dob),
                          // @ts-ignore: department field might not be in generated type yet
                          department: item.departmentId, 
                      }
                  });
              }
              count++;
          }
      });
      return { count };
  }
}
