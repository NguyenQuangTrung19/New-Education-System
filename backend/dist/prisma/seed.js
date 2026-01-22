"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    try {
        const admin = await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: 'password123',
                email: 'admin@edusphere.edu',
                name: 'System Administrator',
                role: client_1.UserRole.ADMIN,
            },
        });
        console.log('Created admin');
    }
    catch (e) {
        console.log('Admin likely exists or error', e.code);
    }
    try {
        const teacher1 = await prisma.user.upsert({
            where: { username: 'sarah.connor' },
            update: {},
            create: {
                username: 'sarah.connor',
                password: 'password123',
                email: 'sarah.connor@edusphere.edu',
                name: 'Dr. Sarah Connor',
                role: client_1.UserRole.TEACHER,
                teacher: {
                    create: {
                        id: 'GV0001',
                        subjects: ['Physics', 'Math'],
                        phone: '+1 555-0101',
                        classesAssigned: 4
                    }
                }
            },
        });
        console.log('Created teacher1');
    }
    catch (e) {
        console.log('Teacher1 likely exists or error', e.code);
    }
    try {
        const teacher2 = await prisma.user.upsert({
            where: { username: 'alan.grant' },
            update: {},
            create: {
                username: 'alan.grant',
                password: 'password123',
                email: 'alan.grant@edusphere.edu',
                name: 'Prof. Alan Grant',
                role: client_1.UserRole.TEACHER,
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
    }
    catch (e) {
        console.log('Teacher2 likely exists or error', e.code);
    }
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
    }
    catch (e) {
        console.log('Class 10A1 likely exists or error', e.code);
    }
    try {
        const student1 = await prisma.user.upsert({
            where: { username: 'alice.j' },
            update: {},
            create: {
                username: 'alice.j',
                password: 'password123',
                email: 'alice@edusphere.edu',
                name: 'Alice Johnson',
                role: client_1.UserRole.STUDENT,
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
    }
    catch (e) {
        console.log('Student1 likely exists or error', e.code);
    }
    try {
        const student2 = await prisma.user.upsert({
            where: { username: 'bob.smith' },
            update: {},
            create: {
                username: 'bob.smith',
                password: 'password123',
                email: 'bob@edusphere.edu',
                name: 'Bob Smith',
                role: client_1.UserRole.STUDENT,
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
    }
    catch (e) {
        console.log('Student2 likely exists or error', e.code);
    }
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
    }
    catch (e) {
        console.log('Subjects likely exist', e);
    }
    try {
        await prisma.assignment.create({
            data: {
                title: 'Algebra Quiz 1',
                description: 'Solve the quadratic equations.',
                subjectId: 'SUBJ001',
                teacherId: 'GV0001',
                dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                duration: 60,
                questions: [
                    { id: 1, text: "Solve x^2 - 4 = 0", options: ["2", "-2", "2, -2", "4"], correct: 2 },
                    { id: 2, text: "What is the square root of 16?", options: ["2", "4", "8", "6"], correct: 1 }
                ]
            }
        });
        console.log('Created Assignment 1');
    }
    catch (e) {
        console.log('Assignment creation failed', e);
    }
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
//# sourceMappingURL=seed.js.map