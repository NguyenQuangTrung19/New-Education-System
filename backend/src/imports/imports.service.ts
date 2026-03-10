import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ImportStudentDto } from './dto/import-student.dto';
import { ImportTeacherDto } from './dto/import-teacher.dto';
import { ImportClassDto } from './dto/import-class.dto';
import * as XLSX from 'xlsx';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';
import { Gender } from '../students/dto/create-student.dto';

const STUDENT_HEADERS = {
  student_code: 'student_code',
  full_name: 'full_name',
  username: 'username',
  dob: 'dob',
  gender: 'gender',
  email: 'email',
  address: 'address',
  class_name: 'class_name',
  guardian_name: 'guardian_name',
  guardian_phone: 'guardian_phone',
  guardian_birth_year: 'guardian_birth_year',
  guardian_occupation: 'guardian_occupation',
  guardian_citizen_id: 'guardian_citizen_id',
};

const TEACHER_HEADERS = {
  full_name: 'full_name',
  username: 'username',
  start_year: 'start_year',
  dob: 'dob',
  gender: 'gender',
  citizen_id: 'citizen_id',
  email: 'email',
  phone: 'phone',
  address: 'address',
  subjects: 'subjects',
};

const CLASS_HEADERS = {
  class_name: 'class_name',
  classroom: 'classroom',
  academic_year: 'academic_year',
  homeroom_teacher: 'homeroom_teacher',
  description: 'description',
};

@Injectable()
export class ImportsService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private passwordService: PasswordService,
  ) {}

  async importData(file: Express.Multer.File, type: string) {
    if (!file) throw new BadRequestException('No file provided');
    if (type !== 'students' && type !== 'teachers' && type !== 'classes')
      throw new BadRequestException('Invalid import type');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (jsonData.length === 0) throw new BadRequestException('File is empty');

    // 1. Validate Headers
    const firstRow = jsonData[0] as object;
    const headers = Object.keys(firstRow || {});
    let expectedHeaders: string[] = [];
    if (type === 'students') expectedHeaders = Object.keys(STUDENT_HEADERS);
    else if (type === 'teachers')
      expectedHeaders = Object.keys(TEACHER_HEADERS);
    else expectedHeaders = Object.keys(CLASS_HEADERS);

    const errors: any[] = [];
    const skipped: any[] = [];
    const validData: any[] = [];
    
    // Tracking sets to catch duplicates within the file itself
    const seenUsernames = new Set<string>();
    const seenEmails = new Set<string>();

    // PREFETCH DATA for faster validation to prevent Vercel 504 Timeouts
    const allUsers = await this.prisma.user.findMany({
      select: { username: true, email: true },
    });
    const dbUsernames = new Set(allUsers.map((u) => u.username.toLowerCase()));
    const dbEmails = new Set(
      allUsers.filter((u) => u.email).map((u) => u.email.toLowerCase())
    );

    let dbClasses: any[] = [];
    if (type === 'students' || type === 'classes') {
      dbClasses = await this.prisma.classGroup.findMany({
        select: { id: true, name: true, academicYear: true },
      });
    }

    let dbSubjects: any[] = [];
    if (type === 'teachers') {
      dbSubjects = await this.prisma.subject.findMany({
        select: { id: true, name: true, code: true, department: true },
      });
    }

    let dbTeacherUsers: any[] = [];
    if (type === 'classes') {
      dbTeacherUsers = await this.prisma.user.findMany({
        where: { role: 'TEACHER' },
        include: { teacher: true },
      });
    }

    // Parse and Validate Rows
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNum = i + 2; // Row 1 is header
      const errorBase = { row: rowNum };

      if (type === 'students') {
        if (row.guardian_citizen_id !== undefined)
          row.guardian_citizen_id = this.sanitizeStringNumber(
            row.guardian_citizen_id,
            12,
          );
        if (row.guardian_phone !== undefined)
          row.guardian_phone = this.sanitizeStringNumber(
            row.guardian_phone,
            10,
          );

        const dto = plainToInstance(ImportStudentDto, row);

        if (row.dob) dto.dob = this.parseDate(row.dob);
        if (row.gender) dto.gender = this.parseGender(row.gender);

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
          validationErrors.forEach((err) => {
            errors.push({
              ...errorBase,
              column: err.property,
              error: Object.values(err.constraints || {})[0],
            });
          });
          continue;
        }

        const classNameLower = row.class_name?.toString().toLowerCase();
        const classGroup = dbClasses.find(c => c.name.toLowerCase() === classNameLower);
        if (!classGroup) {
          errors.push({
            ...errorBase,
            column: 'class_name',
            error: `Class '${row.class_name}' not found`,
          });
        }

        const usernameLower = row.username?.toString().toLowerCase();
        if (usernameLower) {
          if (seenUsernames.has(usernameLower)) {
             skipped.push({
              ...errorBase,
              column: 'username',
              reason: `Username '${row.username}' trùng trong file, đã bỏ qua`,
            });
            continue;
          } else if (dbUsernames.has(usernameLower)) {
             skipped.push({
               ...errorBase,
               column: 'username',
               reason: `Username '${row.username}' đã tồn tại trong hệ thống, đã bỏ qua`,
             });
            continue;
          } else {
             seenUsernames.add(usernameLower);
          }
        }

        const emailLower = row.email?.toString().toLowerCase();
        if (emailLower) {
          if (seenEmails.has(emailLower)) {
             skipped.push({
               ...errorBase,
               column: 'email',
               reason: `Email '${row.email}' trùng trong file, đã bỏ qua`,
             });
            continue;
          } else if (dbEmails.has(emailLower)) {
             skipped.push({
               ...errorBase,
               column: 'email',
               reason: `Email '${row.email}' đã tồn tại trong hệ thống, đã bỏ qua`,
             });
            continue;
          } else {
            seenEmails.add(emailLower);
          }
        }

        if (errors.filter((e) => e.row === rowNum).length === 0) {
          validData.push({ ...dto, classId: classGroup?.id });
        }
      } else if (type === 'teachers') {
        if (row.citizen_id !== undefined)
          row.citizen_id = this.sanitizeStringNumber(row.citizen_id, 12);
        if (row.phone !== undefined)
          row.phone = this.sanitizeStringNumber(row.phone, 10);

        const dto = plainToInstance(ImportTeacherDto, row);
        if (row.dob) dto.dob = this.parseDate(row.dob);
        if (row.gender) dto.gender = this.parseGender(row.gender);

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
          validationErrors.forEach((err) => {
            errors.push({
              ...errorBase,
              column: err.property,
              error: Object.values(err.constraints || {})[0],
            });
          });
          continue;
        }

        const usernameLower = row.username?.toString().toLowerCase();
        if (usernameLower) {
          if (seenUsernames.has(usernameLower)) {
             skipped.push({
              ...errorBase,
              column: 'username',
              reason: `Username '${row.username}' trùng trong file, đã bỏ qua`,
            });
            continue;
          } else if (dbUsernames.has(usernameLower)) {
             skipped.push({
               ...errorBase,
               column: 'username',
               reason: `Username '${row.username}' đã tồn tại trong hệ thống, đã bỏ qua`,
             });
            continue;
          } else {
             seenUsernames.add(usernameLower);
          }
        }

        const emailLower = row.email?.toString().toLowerCase();
        if (emailLower) {
          if (seenEmails.has(emailLower)) {
             skipped.push({
               ...errorBase,
               column: 'email',
               reason: `Email '${row.email}' trùng trong file, đã bỏ qua`,
             });
            continue;
          } else if (dbEmails.has(emailLower)) {
             skipped.push({
               ...errorBase,
               column: 'email',
               reason: `Email '${row.email}' đã tồn tại trong hệ thống, đã bỏ qua`,
             });
            continue;
          } else {
            seenEmails.add(emailLower);
          }
        }

        const subjects = (row.subjects as string)
          .split(',')
          .map((s: string) => s.trim());
        let departmentId = null;
        let normalizedSubjects: string[] = [];

        for (const subjName of subjects) {
          const subjNameLower = subjName.toLowerCase();
          const subj = dbSubjects.find(s => s.code.toLowerCase() === subjNameLower || s.name.toLowerCase() === subjNameLower);
          if (!subj) {
            errors.push({
              ...errorBase,
              column: 'subjects',
              error: `Subject '${subjName}' not found`,
            });
          } else {
            normalizedSubjects.push(subj.name); // Lưu lại tên chuẩn có sẵn trong DB (vd: Tiếng anh)
            if (!departmentId) departmentId = subj.department;
          }
        }

        if (errors.filter((e) => e.row === rowNum).length === 0) {
          validData.push({ ...dto, departmentId, subjectList: normalizedSubjects });
        }
      } else if (type === 'classes') {
        const dto = plainToInstance(ImportClassDto, row);

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
          validationErrors.forEach((err) => {
            errors.push({
              ...errorBase,
              column: err.property,
              error: Object.values(err.constraints || {})[0],
            });
          });
          continue;
        }

        let teacherId = null;
        if (row.homeroom_teacher) {
          const teacherUsernameLower = row.homeroom_teacher.toString().toLowerCase();
          const teacher = dbTeacherUsers.find(t => t.username.toLowerCase() === teacherUsernameLower);
          if (!teacher || teacher.role !== 'TEACHER' || !teacher.teacher) {
            errors.push({
              ...errorBase,
              column: 'homeroom_teacher',
              error: `Teacher username '${row.homeroom_teacher}' not found or invalid`,
            });
          } else {
            teacherId = teacher.teacher.id;
          }
        }

        const classNameLower = row.class_name?.toString().toLowerCase();
        const existingClass = dbClasses.find(c => c.name.toLowerCase() === classNameLower && c.academicYear === row.academic_year);

        if (existingClass) {
          errors.push({
            ...errorBase,
            column: 'class_name',
            error: `Class '${row.class_name}' already exists in year ${row.academic_year}`,
          });
        }

        // Extract grade level from class name (e.g., "10A1" -> 10)
        const match = row.class_name.match(/^(\d+)/);
        const gradeLevel = match ? parseInt(match[1], 10) : 10; // Default to 10 if not found

        if (errors.filter((e) => e.row === rowNum).length === 0) {
          validData.push({ ...dto, teacherId, gradeLevel });
        }
      }
    }

    if (errors.length > 0 && validData.length === 0) {
      throw new BadRequestException({ message: 'Validation Failed', errors });
    }

    const result = await this.saveData(validData, type);
    return { ...result, skipped };
  }

  async importBatch(jsonData: any[], type: string, batchIndex: number, totalBatches: number) {
    if (type !== 'students' && type !== 'teachers' && type !== 'classes')
      throw new BadRequestException('Invalid import type');

    if (jsonData.length === 0) throw new BadRequestException('Batch data is empty');

    const errors: any[] = [];
    const skipped: any[] = [];
    const validData: any[] = [];
    
    const seenUsernames = new Set<string>();
    const seenEmails = new Set<string>();

    // PREFETCH DATA for validation
    const allUsers = await this.prisma.user.findMany({
      select: { username: true, email: true },
    });
    const dbUsernames = new Set(allUsers.map((u) => u.username.toLowerCase()));
    const dbEmails = new Set(
      allUsers.filter((u) => u.email).map((u) => u.email.toLowerCase())
    );

    let dbClasses: any[] = [];
    if (type === 'students' || type === 'classes') {
      dbClasses = await this.prisma.classGroup.findMany({
        select: { id: true, name: true, academicYear: true },
      });
    }

    let dbSubjects: any[] = [];
    if (type === 'teachers') {
      dbSubjects = await this.prisma.subject.findMany({
        select: { id: true, name: true, code: true, department: true },
      });
    }

    let dbTeacherUsers: any[] = [];
    if (type === 'classes') {
      dbTeacherUsers = await this.prisma.user.findMany({
        where: { role: 'TEACHER' },
        include: { teacher: true },
      });
    }

    // Validate rows
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNum = (batchIndex * jsonData.length) + i + 2; // approximate original row
      const errorBase = { row: rowNum };

      if (type === 'students') {
        if (row.guardian_citizen_id !== undefined)
          row.guardian_citizen_id = this.sanitizeStringNumber(row.guardian_citizen_id, 12);
        if (row.guardian_phone !== undefined)
          row.guardian_phone = this.sanitizeStringNumber(row.guardian_phone, 10);

        const dto = plainToInstance(ImportStudentDto, row);
        if (row.dob) dto.dob = this.parseDate(row.dob);
        if (row.gender) dto.gender = this.parseGender(row.gender);

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
          validationErrors.forEach((err) => {
            errors.push({
              ...errorBase,
              column: err.property,
              error: Object.values(err.constraints || {})[0],
            });
          });
          continue;
        }

        const classNameLower = row.class_name?.toString().toLowerCase();
        const classGroup = dbClasses.find(c => c.name.toLowerCase() === classNameLower);
        if (!classGroup) {
          errors.push({ ...errorBase, column: 'class_name', error: `Class '${row.class_name}' not found` });
        }

        const usernameLower = row.username?.toString().toLowerCase();
        if (usernameLower) {
          if (seenUsernames.has(usernameLower)) {
            skipped.push({ ...errorBase, column: 'username', reason: `Username '${row.username}' trùng trong batch, đã bỏ qua` });
            continue;
          } else if (dbUsernames.has(usernameLower)) {
            skipped.push({ ...errorBase, column: 'username', reason: `Username '${row.username}' đã tồn tại trong hệ thống, đã bỏ qua` });
            continue;
          } else {
            seenUsernames.add(usernameLower);
          }
        }

        const emailLower = row.email?.toString().toLowerCase();
        if (emailLower) {
          if (seenEmails.has(emailLower)) {
            skipped.push({ ...errorBase, column: 'email', reason: `Email '${row.email}' trùng trong batch, đã bỏ qua` });
            continue;
          } else if (dbEmails.has(emailLower)) {
            skipped.push({ ...errorBase, column: 'email', reason: `Email '${row.email}' đã tồn tại trong hệ thống, đã bỏ qua` });
            continue;
          } else {
            seenEmails.add(emailLower);
          }
        }

        if (errors.filter((e) => e.row === rowNum).length === 0) {
          validData.push({ ...dto, classId: classGroup?.id });
        }
      } else if (type === 'teachers') {
        if (row.citizen_id !== undefined)
          row.citizen_id = this.sanitizeStringNumber(row.citizen_id, 12);
        if (row.phone !== undefined)
          row.phone = this.sanitizeStringNumber(row.phone, 10);

        const dto = plainToInstance(ImportTeacherDto, row);
        if (row.dob) dto.dob = this.parseDate(row.dob);
        if (row.gender) dto.gender = this.parseGender(row.gender);

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
          validationErrors.forEach((err) => {
            errors.push({
              ...errorBase,
              column: err.property,
              error: Object.values(err.constraints || {})[0],
            });
          });
          continue;
        }

        const usernameLower = row.username?.toString().toLowerCase();
        if (usernameLower) {
          if (seenUsernames.has(usernameLower)) {
            skipped.push({ ...errorBase, column: 'username', reason: `Username '${row.username}' trùng trong batch, đã bỏ qua` });
            continue;
          } else if (dbUsernames.has(usernameLower)) {
            skipped.push({ ...errorBase, column: 'username', reason: `Username '${row.username}' đã tồn tại trong hệ thống, đã bỏ qua` });
            continue;
          } else {
            seenUsernames.add(usernameLower);
          }
        }

        const emailLower = row.email?.toString().toLowerCase();
        if (emailLower) {
          if (seenEmails.has(emailLower)) {
            skipped.push({ ...errorBase, column: 'email', reason: `Email '${row.email}' trùng trong batch, đã bỏ qua` });
            continue;
          } else if (dbEmails.has(emailLower)) {
            skipped.push({ ...errorBase, column: 'email', reason: `Email '${row.email}' đã tồn tại trong hệ thống, đã bỏ qua` });
            continue;
          } else {
            seenEmails.add(emailLower);
          }
        }

        const subjects = (row.subjects as string).split(',').map((s: string) => s.trim());
        let departmentId = null;
        let normalizedSubjects: string[] = [];

        for (const subjName of subjects) {
          const subjNameLower = subjName.toLowerCase();
          const subj = dbSubjects.find(s => s.code.toLowerCase() === subjNameLower || s.name.toLowerCase() === subjNameLower);
          if (!subj) {
            errors.push({ ...errorBase, column: 'subjects', error: `Subject '${subjName}' not found` });
          } else {
            normalizedSubjects.push(subj.name);
            if (!departmentId) departmentId = subj.department;
          }
        }

        if (errors.filter((e) => e.row === rowNum).length === 0) {
          validData.push({ ...dto, departmentId, subjectList: normalizedSubjects });
        }
      } else if (type === 'classes') {
        const dto = plainToInstance(ImportClassDto, row);

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
          validationErrors.forEach((err) => {
            errors.push({
              ...errorBase,
              column: err.property,
              error: Object.values(err.constraints || {})[0],
            });
          });
          continue;
        }

        let teacherId = null;
        if (row.homeroom_teacher) {
          const teacherUsernameLower = row.homeroom_teacher.toString().toLowerCase();
          const teacher = dbTeacherUsers.find(t => t.username.toLowerCase() === teacherUsernameLower);
          if (!teacher || teacher.role !== 'TEACHER' || !teacher.teacher) {
            errors.push({ ...errorBase, column: 'homeroom_teacher', error: `Teacher username '${row.homeroom_teacher}' not found or invalid` });
          } else {
            teacherId = teacher.teacher.id;
          }
        }

        const classNameLower = row.class_name?.toString().toLowerCase();
        const existingClass = dbClasses.find(c => c.name.toLowerCase() === classNameLower && c.academicYear === row.academic_year);
        if (existingClass) {
          errors.push({ ...errorBase, column: 'class_name', error: `Class '${row.class_name}' already exists in year ${row.academic_year}` });
        }

        const match = row.class_name.match(/^(\d+)/);
        const gradeLevel = match ? parseInt(match[1], 10) : 10;

        if (errors.filter((e) => e.row === rowNum).length === 0) {
          validData.push({ ...dto, teacherId, gradeLevel });
        }
      }
    }

    if (errors.length > 0 && validData.length === 0) {
      throw new BadRequestException({ message: 'Validation Failed', errors });
    }

    const result = await this.saveData(validData, type);
    return {
      ...result,
      skipped,
      batchIndex,
      totalBatches,
    };
  }

  private parseDate(val: any): string | null {
    if (!val) return null;
    if (typeof val === 'number') {
      const date = XLSX.SSF.parse_date_code(val);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
    
    // Handle dd/mm/yyyy string format
    const strVal = String(val).trim();
    if (strVal.includes('/')) {
      const parts = strVal.split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; // Convert back to YYYY-MM-DD for Prisma/Date
      }
    } else if (strVal.includes('-')) {
        const parts = strVal.split('-');
        if (parts.length === 3 && parts[0].length === 2) { // dd-mm-yyyy
            const [d, m, y] = parts;
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
    }
    return strVal;
  }

  private parseGender(val: any): Gender {
    if (!val) return null as any;
    const str = String(val).toLowerCase().trim();
    if (str === 'male' || str === 'nam') return Gender.Male;
    if (str === 'female' || str === 'nữ') return Gender.Female;
    return Gender.Other;
  }

  private sanitizeStringNumber(val: any, targetLength: number): string {
    if (val === undefined || val === null) return '';
    let str = String(val).trim();

    // Remove leading apostrophe which users add to force text in Excel
    if (str.startsWith("'")) {
      str = str.substring(1);
    }

    // Check if the value was parsed as a numeric format (e.g., scientific notation)
    // and attempt to recover the exact integer representation
    if (typeof val === 'number') {
      const numStr = val.toLocaleString('fullwide', { useGrouping: false });
      if (numStr && numStr !== 'NaN') {
        str = numStr;
      }
    }

    // Clean up purely numeric strings
    if (/^\d+$/.test(str)) {
      // Pad zeros to reach target length if we are short (e.g., dropped leading zeros)
      while (str.length < targetLength) {
        str = '0' + str;
      }
    }

    return str;
  }

  private async saveData(data: any[], type: string) {
    let count = 0;

    // Compute default password hash outside the transaction to prevent timeout
    let defaultPass = '';
    if (type !== 'classes') {
      defaultPass = await this.passwordService.hashPassword('123456');
    }

    const responseErrors: {row: string, detail: string}[] = [];
    
    // Chunk array into batches of 10 to provide true concurrent execution 
    // without exhausting the Prisma connection pool.
    const CHUNK_SIZE = 10;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);

      await Promise.all(chunk.map(async (item) => {
        if (type === 'classes') {
          try {
            const id = await this.idGenerator.generateClassId(item.academic_year);
            await this.prisma.classGroup.create({
              data: {
                id,
                name: item.class_name,
                gradeLevel: item.gradeLevel,
                room: item.classroom,
                academicYear: item.academic_year,
                description: item.description,
                teacherId: item.teacherId,
              },
            });
            count++;
          } catch (err: any) {
            responseErrors.push({ row: item.class_name, detail: err.message });
          }
        } else {
          // User creation for Students and Teachers
          try {
            // GENERATE ID OUTSIDE THE TRANSACTION!
            // This prevents Postgres from holding an exclusive row lock on the IdSequence table 
            // for the entire duration of the transaction, which caused 504 Timeouts.
            let generatedId = '';
            if (type === 'students' && !item.student_code) {
               generatedId = await this.idGenerator.generateStudentId();
            } else if (type === 'teachers') {
               generatedId = await this.idGenerator.generateTeacherId();
            }

            await this.prisma.$transaction(async (tx) => {
              const user = await tx.user.create({
                data: {
                  username: item.username,
                  password: defaultPass,
                  name: item.full_name,
                  email: item.email || `${item.username}@school.edu`,
                  role: type === 'students' ? 'STUDENT' : 'TEACHER',
                },
              });

              if (type === 'students') {
                const id = item.student_code || generatedId;
                console.log('DEBUG_IMPORT_ITEM:', JSON.stringify(item));
                // @ts-ignore
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
                    guardianYearOfBirth: item.guardian_birth_year ? parseInt(item.guardian_birth_year, 10) : null,
                  },
                });
              } else if (type === 'teachers') {
                const id = generatedId;
                await tx.teacher.create({
                  data: {
                    id,
                    userId: user.id,
                    subjects: item.subjectList,
                    citizenId: item.citizen_id,
                    gender: item.gender as any,
                    phone: item.phone,
                    address: item.address,
                    joinYear: item.start_year,
                    dateOfBirth: new Date(item.dob),
                    // @ts-ignore
                    department: item.departmentId,
                  },
                });
              }
            }, {
              timeout: 10000 // 10s per transaction
            });
            count++;
          } catch (err: any) {
            responseErrors.push({ row: item.username || item.full_name, detail: err?.meta || err.message || String(err) });
          }
        }
      }));
    }

    if (responseErrors.length > 0 && count === 0) {
      throw new BadRequestException({ message: 'Lỗi khi lưu dữ liệu vào hệ thống. Không có dòng nào được import.', details: responseErrors });
    }

    return { count, errors: responseErrors };
  }
}
