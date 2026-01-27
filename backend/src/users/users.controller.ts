import { Controller, Patch, Param, Body, UseGuards, Request, Get, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Patch(':id/password')
    async updatePassword(@Request() req: any, @Param('id') id: string, @Body('password') password: string) {
        // Enforce Admin Role
        if (req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only admins can update passwords');
        }
        
        return this.usersService.updatePassword(id, password);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/credentials')
    async getCredentials(@Request() req: any, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only admins can view credentials');
        }
        return this.usersService.getUserCredentials(id);
    }
}
