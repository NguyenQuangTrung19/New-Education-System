import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { PasswordService } from '../common/password.service';
export declare class UsersService {
    private prisma;
    private passwordService;
    constructor(prisma: PrismaService, passwordService: PasswordService);
    findOne(username: string): Promise<User | null>;
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    findById(id: string): Promise<User | null>;
    updatePassword(id: string, password: string): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        passwordEncrypted: string | null;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserCredentials(id: string): Promise<{
        password: null;
    } | {
        password: string;
    }>;
    verifyPassword(id: string, plainPassword: string): Promise<boolean>;
}
