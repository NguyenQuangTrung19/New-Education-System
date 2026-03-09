import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
    role: string,
  ): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException('Username không tồn tại');
    }
    const isPasswordValid = await this.usersService.verifyPassword(user.id, pass);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai password');
    }
    if (user.role !== role) {
      throw new UnauthorizedException('Sai quyền truy cập');
    }
    const { password, ...result } = user;
    return result;
  }

  async verifyPassword(userId: string, pass: string): Promise<boolean> {
    return this.usersService.verifyPassword(userId, pass);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
}
