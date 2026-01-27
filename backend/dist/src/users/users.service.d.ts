import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(username: string): Promise<User | null>;
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    findById(id: string): Promise<User | null>;
    updatePassword(id: string, password: string): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserCredentials(id: string): Promise<{
        password: string;
    } | null>;
}
