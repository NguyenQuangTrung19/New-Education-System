import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  private getEncryptionKey(): Buffer {
    const rawKey = process.env.PASSWORD_ENCRYPTION_KEY;
    if (!rawKey) {
      throw new Error('PASSWORD_ENCRYPTION_KEY is required');
    }
    const key = Buffer.from(rawKey, 'base64');
    if (key.length !== 32) {
      throw new Error('PASSWORD_ENCRYPTION_KEY must be 32 bytes (base64)');
    }
    return key;
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  encryptPassword(plain: string): string {
    const key = this.getEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv, tag, encrypted].map((part) => part.toString('base64')).join('.');
  }

  decryptPassword(payload: string): string {
    const key = this.getEncryptionKey();
    const [ivB64, tagB64, dataB64] = payload.split('.');
    if (!ivB64 || !tagB64 || !dataB64) {
      throw new Error('Invalid encrypted password format');
    }
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
