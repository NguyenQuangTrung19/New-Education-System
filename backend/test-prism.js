const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const p = new PrismaClient();
p.student.findMany({where: {id: { in: ['S002', 'HS1120'] }}, include: { class: true }}).then(v => { 
  fs.writeFileSync('test-output.json', JSON.stringify(v, null, 2)); 
  p.$disconnect() 
});
