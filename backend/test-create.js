const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cls = await prisma.classGroup.findFirst();
  if (!cls) return console.log("No class");
  
  console.log("ClassId inside DB:", cls.id);

  try {
    const user = await prisma.user.create({
      data: {
        username: "test_" + Date.now(),
        password: "abc",
        name: "test user",
        email: "ttt" + Date.now() + "@b.c",
        role: "STUDENT"
      }
    });

    const stu = await prisma.student.create({
      data: {
        id: "T" + Date.now().toString().slice(-6),
        userId: user.id,
        classId: cls.id,
        enrollmentYear: 2026
      }
    });

    console.log("Created student:", stu);
  } catch (e) {
    console.log("Error:", e);
  } finally {
    prisma.$disconnect();
  }
}

run();
