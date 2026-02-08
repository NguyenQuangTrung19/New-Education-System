export declare class PasswordService {
    private getEncryptionKey;
    hashPassword(plain: string): Promise<string>;
    verifyPassword(plain: string, hash: string): Promise<boolean>;
    encryptPassword(plain: string): string;
    decryptPassword(payload: string): string;
}
