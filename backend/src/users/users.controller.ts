import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ChangeOwnPasswordDto,
} from './dto/password.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changeOwnPassword(
    @Request() req: any,
    @Body() body: ChangeOwnPasswordDto,
  ) {
    if (body.currentPassword === body.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }
    const isValid = await this.usersService.verifyPassword(
      req.user.userId,
      body.currentPassword,
    );
    if (!isValid) {
      throw new UnauthorizedException('Incorrect password');
    }
    await this.usersService.updatePassword(req.user.userId, body.newPassword);
    return { success: true };
  }
}
