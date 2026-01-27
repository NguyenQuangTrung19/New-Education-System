import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    // In a real app, use bcrypt.compare(pass, user.password)
    // Also validate if the user's role matches the requested role
    if (user && user.password === pass && user.role === role) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async verifyPassword(userId: string, pass: string): Promise<boolean> {
      // Find user by ID
      const user = await this.usersService.findById(userId);
      
      if (user && user.password === pass) {
          return true;
      }
      return false;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }
}
