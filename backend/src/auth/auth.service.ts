import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string, role: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await this.usersService.verifyPassword(user.id, pass) && user.role === role) {
      const { password, passwordEncrypted, ...result } = user;
      return result;
    }
    return null;
  }

  async verifyPassword(userId: string, pass: string): Promise<boolean> {
      return this.usersService.verifyPassword(userId, pass);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }
}
