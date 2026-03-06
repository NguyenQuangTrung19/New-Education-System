import { PrismaClient, UserRole, Gender, AttendanceStatus, TuitionStatus, TuitionSemesterStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};


async function main() {
  console.log('Seeding database...');

  const defaultPasswordHash = await hashPassword('password123');

  // 0. Create Admin
  try {
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: defaultPasswordHash,
        email: 'admin@thcsphuoctan.edu.vn',
        name: 'Quản trị viên hệ thống',
        role: UserRole.ADMIN,
      },
    });
    console.log('Created admin');
  } catch(e) { console.log('Admin likely exists or error', e.code); }

  // 1. Create Teachers
  try {
    const teacher1 = await prisma.user.upsert({
      where: { username: 'gv.nguyenvanan' },
      update: {},
      create: {
        username: 'gv.nguyenvanan',
        password: defaultPasswordHash,
        email: 'nguyenvanan@thcsphuoctan.edu.vn',
        name: 'Nguyễn Văn An',
        role: UserRole.TEACHER,
        teacher: {
          create: {
              id: 'GV0001',
              subjects: ['Vật lý', 'Toán học'],
              phone: '0901234567',
              classesAssigned: 4
          }
        }
      },
    });
    console.log('Created teacher1');
  } catch(e) { console.log('Teacher1 likely exists or error', e.code); }

  try {
    const teacher2 = await prisma.user.upsert({
      where: { username: 'gv.tranthib' },
      update: {},
      create: {
        username: 'gv.tranthib',
        password: defaultPasswordHash,
        email: 'tranthib@thcsphuoctan.edu.vn',
        name: 'Trần Thị Bình',
        role: UserRole.TEACHER,
        teacher: {
          create: {
              id: 'GV0002',
              subjects: ['Sinh học'],
              classesAssigned: 3
          }
        }
      },
    });
     console.log('Created teacher2');
  } catch(e) { console.log('Teacher2 likely exists or error', e.code); }

  // 2. Create Classes
  
  try {
    const class10A1 = await prisma.classGroup.upsert({
        where: { name: '10A1' },
        update: {},
        create: {
            id: 'C101',
            name: '10A1',
            gradeLevel: 10,
            room: 'Phòng 101',
            academicYear: '2025-2026',
            description: 'Lớp chọn Khối 10 - Ban Khoa học Tự nhiên.',
            teacher: {
                connect: { id: 'GV0001' }
            },
            studentCount: 2,
            maleStudentCount: 1,
            femaleStudentCount: 1,
            weeklyScoreHistory: [
                { week: 1, score: 100 },
                { week: 2, score: 98 }
            ],
            notes: []
        }
    });
    console.log('Created class10A1');
  } catch (e) { console.log('Class 10A1 likely exists or error', e.code); }


  // 3. Create Students
  try {
    const student1 = await prisma.user.upsert({
        where: { username: 'hs.lethimai' },
        update: {},
        create: {
        username: 'hs.lethimai',
        password: defaultPasswordHash,
        email: 'lethimai@thcsphuoctan.edu.vn',
        name: 'Lê Thị Mai',
        role: UserRole.STUDENT,
        student: {
            create: {
                id: 'S001',
                enrollmentYear: 2023,
                class: { connect: { id: 'C101' } }, 
                gpa: 8.8,
                dateOfBirth: new Date('2008-05-15'),
                guardianName: 'Lê Văn Hùng',
                semesterEvaluation: 'Học sinh chăm ngoan, học tốt các môn Tự nhiên.'
            }
        }
        }
    });
    console.log('Created student1');
  } catch (e) { console.log('Student1 likely exists or error', e.code); }

  try {
    const student2 = await prisma.user.upsert({
        where: { username: 'hs.phamvanminh' },
        update: {},
        create: {
        username: 'hs.phamvanminh',
        password: defaultPasswordHash,
        email: 'phamvanminh@thcsphuoctan.edu.vn',
        name: 'Phạm Văn Minh',
        role: UserRole.STUDENT,
        student: {
            create: {
                id: 'S002',
                enrollmentYear: 2023,
                class: { connect: { id: 'C101' } },
                gpa: 8.2,
                dateOfBirth: new Date('2008-08-20'),
                guardianName: 'Phạm Văn Đức',
                semesterEvaluation: 'Cần cố gắng hơn môn Ngữ Văn.'
            }
        }
        }
    });
    console.log('Created student2');
  } catch (e) { console.log('Student2 likely exists or error', e.code); }

  // 4. Create Subjects
  try {
      const math = await prisma.subject.upsert({
          where: { code: 'TOAN10' },
          update: {},
          create: {
              id: 'SUBJ001',
              name: 'Toán học 10',
              code: 'TOAN10',
              department: 'Tổ Toán - Tin',
              description: 'Chương trình Toán học lớp 10.'
          }
      });
      console.log('Created Subject Math');

      const physics = await prisma.subject.upsert({
          where: { code: 'LY10' },
          update: {},
          create: {
              id: 'SUBJ002',
              name: 'Vật lý 10',
              code: 'LY10',
              department: 'Tổ Khoa học Tự nhiên',
              description: 'Chương trình Vật lý lớp 10.'
          }
      });
      console.log('Created Subject Physics');
  } catch (e) { console.log('Subjects likely exist', e); }

  // 5. Create Assignments
  try {
      await prisma.assignment.create({
          data: {
              title: 'Kiểm tra 15 phút Đại số',
              description: 'Giải các phương trình bậc hai sau.',
              subjectId: 'SUBJ001',
              teacherId: 'GV0001', // Nguyen Van An
              dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Due inside 1 week
              duration: 15,
              questions: [
                  { id: 1, text: "Giải phương trình x^2 - 4 = 0", options: ["2", "-2", "2, -2", "4"], correct: 2 },
                  { id: 2, text: "Căn bậc hai của 16 là bao nhiêu?", options: ["2", "4", "8", "6"], correct: 1 }
              ]
          }
      });
      console.log('Created Assignment 1');
  } catch (e) { console.log('Assignment creation failed', e); }


  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
