import { Controller, Patch, Param, Body, UseGuards, Request, Get, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';
import { AdminUpdatePasswordDto, ChangeOwnPasswordDto } from './dto/password.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Patch('me/password')
    async changeOwnPassword(@Request() req: any, @Body() body: ChangeOwnPasswordDto) {
        if (body.currentPassword === body.newPassword) {
            throw new BadRequestException('New password must be different from current password');
        }
        const isValid = await this.usersService.verifyPassword(req.user.userId, body.currentPassword);
        if (!isValid) {
            throw new UnauthorizedException('Incorrect password');
        }
        await this.usersService.updatePassword(req.user.userId, body.newPassword);
        return { success: true };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id/password')
    async updatePassword(@Param('id') id: string, @Body() body: AdminUpdatePasswordDto) {
        return this.usersService.updatePassword(id, body.password);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get(':id/credentials')
    async getCredentials(@Param('id') id: string) {
        return this.usersService.getUserCredentials(id);
    }
}
