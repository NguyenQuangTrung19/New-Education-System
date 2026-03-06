import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  console.log('Admin user:', admin?.username, 'Role:', admin?.role);
  
  if (admin && admin.password) {
    const isValid = await bcrypt.compare('password123', admin.password);
    console.log('password123 isValid:', isValid);
  } else {
    console.log('Admin not found or no password');
  }
}

main().finally(() => prisma.$disconnect());
