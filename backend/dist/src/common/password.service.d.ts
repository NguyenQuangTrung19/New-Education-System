export declare class PasswordService {
    private readonly SALT_ROUNDS;
    hashPassword(plain: string): Promise<string>;
    verifyPassword(plain: string, hash: string): Promise<boolean>;
}
