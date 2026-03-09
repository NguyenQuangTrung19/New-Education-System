import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Login endpoint with strict rate limiting (5 attempts per minute)
   * to prevent brute force attacks.
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
      loginDto.role,
    );
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('verify-password')
  async verifyPassword(
    @Request() req: any,
    @Body('password') password: string,
  ) {
    const isValid = await this.authService.verifyPassword(
      req.user.userId,
      password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Incorrect password');
    }
    return { success: true };
  }
}
