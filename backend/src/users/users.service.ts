import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { PasswordService } from '../common/password.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        teacher: true,
        student: true,
      }
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const plainPassword = data.password;
    const hashedPassword = await this.passwordService.hashPassword(plainPassword);
    const encryptedPassword = this.passwordService.encryptPassword(plainPassword);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        passwordEncrypted: encryptedPassword,
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
    const encryptedPassword = this.passwordService.encryptPassword(password);
    return this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword, passwordEncrypted: encryptedPassword }
    });
  }

  async getUserCredentials(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { passwordEncrypted: true }
    });
    if (!user?.passwordEncrypted) {
      return { password: null };
    }
    const password = this.passwordService.decryptPassword(user.passwordEncrypted);
    return { password };
  }

  async verifyPassword(id: string, plainPassword: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true, passwordEncrypted: true }
    });
    if (!user?.password) return false;
    const isValid = await this.passwordService.verifyPassword(plainPassword, user.password);
    if (!isValid && !user.passwordEncrypted && user.password === plainPassword) {
      await this.updatePassword(id, plainPassword);
      return true;
    }
    return isValid;
  }
}
