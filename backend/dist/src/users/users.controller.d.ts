import { UsersService } from './users.service';
import { AdminUpdatePasswordDto, ChangeOwnPasswordDto } from './dto/password.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    changeOwnPassword(req: any, body: ChangeOwnPasswordDto): Promise<{
        success: boolean;
    }>;
    updatePassword(id: string, body: AdminUpdatePasswordDto): Promise<{
        name: string;
        id: string;
        username: string;
        password: string;
        passwordEncrypted: string | null;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCredentials(id: string): Promise<{
        password: null;
    } | {
        password: string;
    }>;
}
