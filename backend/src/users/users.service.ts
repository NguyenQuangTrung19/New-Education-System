import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updatePassword(id: string, password: string) {
    return this.prisma.user.update({
        where: { id },
        data: { password }
    });
  }

  async getUserCredentials(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { password: true }
    });
  }
}
