import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    updatePassword(req: any, id: string, password: string): Promise<{
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
    getCredentials(req: any, id: string): Promise<{
        password: string;
    } | null>;
}
