import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password, loginDto.role);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials or role');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('verify-password')
  async verifyPassword(@Request() req: any, @Body('password') password: string) {
      // req.user is populated by JwtStrategy
      const isValid = await this.authService.verifyPassword(req.user.userId, password);
      if (!isValid) {
          throw new UnauthorizedException('Incorrect password');
      }
      return { success: true };
  }
}
