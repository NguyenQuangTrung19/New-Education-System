import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { PasswordService } from '../common/password.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        teacher: true,
        student: true,
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword =
      await this.passwordService.hashPassword(data.password);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updatePassword(id: string, password: string) {
    const hashedPassword = await this.passwordService.hashPassword(password);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async verifyPassword(id: string, plainPassword: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
    if (!user?.password) return false;
    return this.passwordService.verifyPassword(plainPassword, user.password);
  }
}
