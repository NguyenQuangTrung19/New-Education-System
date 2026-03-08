import { UsersService } from './users.service';
import { ChangeOwnPasswordDto } from './dto/password.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    changeOwnPassword(req: any, body: ChangeOwnPasswordDto): Promise<{
        success: boolean;
    }>;
}
