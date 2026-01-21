import { PrismaClient, UserRole, Gender, AttendanceStatus, TuitionStatus, TuitionSemesterStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 0. Create Admin
  try {
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: 'password123', // In real app, hash this
        email: 'admin@edusphere.edu',
        name: 'System Administrator',
        role: UserRole.ADMIN,
      },
    });
    console.log('Created admin');
  } catch(e) { console.log('Admin likely exists or error', e.code); }

  // 1. Create Teachers
  try {
    const teacher1 = await prisma.user.upsert({
      where: { username: 'sarah.connor' },
      update: {},
      create: {
        username: 'sarah.connor',
        password: 'password123',
        email: 'sarah.connor@edusphere.edu',
        name: 'Dr. Sarah Connor',
        role: UserRole.TEACHER,
        teacher: {
          create: {
              // id: 'GV0001', // Let uuid handle it or force it if schema allows string input without default? Schema says default(uuid) so we let it exist or force it?
              // Actually schema has @default(uuid()). If I want to match mock data ID, I should provide it.
              id: 'GV0001',
              subjects: ['Physics', 'Math'],
              phone: '+1 555-0101',
              classesAssigned: 4
          }
        }
      },
    });
    console.log('Created teacher1');
  } catch(e) { console.log('Teacher1 likely exists or error', e.code); }

  try {
    const teacher2 = await prisma.user.upsert({
      where: { username: 'alan.grant' },
      update: {},
      create: {
        username: 'alan.grant',
        password: 'password123',
        email: 'alan.grant@edusphere.edu',
        name: 'Prof. Alan Grant',
        role: UserRole.TEACHER,
        teacher: {
          create: {
              id: 'GV0002',
              subjects: ['Biology'],
              classesAssigned: 3
          }
        }
      },
    });
     console.log('Created teacher2');
  } catch(e) { console.log('Teacher2 likely exists or error', e.code); }

  // 2. Create Classes
  // We need teacher1.id but we didn't fetch it if upsert didn't return distinct teacher relation logic easily.
  // Ideally we should query it back if we want to link. 
  // For simplicity, let's just use the known IDs because I forced them in the create block.
  // However, upsert `create` block only runs if not found. If found and `update` is empty, relation might not be established if I rely on `connect`.
  // The `teacher` field in ClassGroup is optional `teacherId`. 
  // Let's create the class and connect using the ID GV0001 which I forced.
  
  try {
    const class10A1 = await prisma.classGroup.upsert({
        where: { name: '10A1' },
        update: {},
        create: {
            id: 'C101',
            name: '10A1',
            gradeLevel: 10,
            room: 'Rm 101',
            academicYear: '2025-2026',
            description: 'Advanced stream for Grade 10.',
            teacher: {
                connect: { id: 'GV0001' }
            }
        }
    });
    console.log('Created class10A1');
  } catch (e) { console.log('Class 10A1 likely exists or error', e.code); }


  // 3. Create Students
  try {
    const student1 = await prisma.user.upsert({
        where: { username: 'alice.j' },
        update: {},
        create: {
        username: 'alice.j',
        password: 'password123',
        email: 'alice@edusphere.edu',
        name: 'Alice Johnson',
        role: UserRole.STUDENT,
        student: {
            create: {
                id: 'S001',
                enrollmentYear: 2023,
                class: { connect: { id: 'C101' } }, 
                gpa: 3.8,
                dateOfBirth: new Date('2008-05-15'),
                guardianName: 'Robert Johnson',
                semesterEvaluation: 'Alice is a brilliant student.'
            }
        }
        }
    });
    console.log('Created student1');
  } catch (e) { console.log('Student1 likely exists or error', e.code); }

  try {
    const student2 = await prisma.user.upsert({
        where: { username: 'bob.smith' },
        update: {},
        create: {
        username: 'bob.smith',
        password: 'password123',
        email: 'bob@edusphere.edu',
        name: 'Bob Smith',
        role: UserRole.STUDENT,
        student: {
            create: {
                id: 'S002',
                enrollmentYear: 2023,
                class: { connect: { id: 'C101' } },
                gpa: 3.2,
                dateOfBirth: new Date('2008-08-20'),
                guardianName: 'Mary Smith',
                semesterEvaluation: 'Needs improvement in Math.'
            }
        }
        }
    });
    console.log('Created student2');
  } catch (e) { console.log('Student2 likely exists or error', e.code); }

  // 4. Create Subjects
  try {
      const math = await prisma.subject.upsert({
          where: { code: 'MATH10' },
          update: {},
          create: {
              id: 'SUBJ001',
              name: 'Mathematics',
              code: 'MATH10',
              department: 'Science',
              description: 'Grade 10 Mathematics'
          }
      });
      console.log('Created Subject Math');

      const physics = await prisma.subject.upsert({
          where: { code: 'PHYS10' },
          update: {},
          create: {
              id: 'SUBJ002',
              name: 'Physics',
              code: 'PHYS10',
              department: 'Science',
              description: 'Grade 10 Physics'
          }
      });
      console.log('Created Subject Physics');
  } catch (e) { console.log('Subjects likely exist', e); }

  // 5. Create Assignments
  try {
      await prisma.assignment.create({
          data: {
              title: 'Algebra Quiz 1',
              description: 'Solve the quadratic equations.',
              subjectId: 'SUBJ001',
              teacherId: 'GV0001', // Sarah Connor
              dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Due inside 1 week
              duration: 60,
              questions: [
                  { id: 1, text: "Solve x^2 - 4 = 0", options: ["2", "-2", "2, -2", "4"], correct: 2 },
                  { id: 2, text: "What is the square root of 16?", options: ["2", "4", "8", "6"], correct: 1 }
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
