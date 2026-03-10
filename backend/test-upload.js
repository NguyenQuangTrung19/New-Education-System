const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cls = await prisma.classGroup.findFirst();
  if (!cls) {
    console.log("No class found!");
    return;
  }
  
  console.log("Found class:", cls.name);

  const payload = {
    data: [
      {
        student_code: "TMP_" + Date.now(),
        full_name: "Test ClassId",
        username: "test_" + Date.now(),
        dob: "2005-01-01",
        gender: "Male",
        email: "test_" + Date.now() + "@test.com",
        address: "123 Test",
        class_name: cls.name,
        guardian_name: "Test Guardian",
        guardian_phone: "0123456789",
        guardian_birth_year: "1980",
        guardian_occupation: "Job",
        guardian_citizen_id: "012345678912"
      }
    ],
    batchIndex: 0,
    totalBatches: 1
  };

  const res = await fetch('http://localhost:8080/imports/upload-batch/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  console.log("Response:", json);
  process.exit(0);
}

run();
