import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

/**
 * Password hashing service using bcrypt.
 * Only one-way hashing — no reversible encryption.
 */
@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.SALT_ROUNDS);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
