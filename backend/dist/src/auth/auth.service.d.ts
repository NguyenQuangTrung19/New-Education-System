import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, pass: string, role: string): Promise<any>;
    verifyPassword(userId: string, pass: string): Promise<boolean>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
}
