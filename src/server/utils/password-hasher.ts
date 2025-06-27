import bcrypt from 'bcrypt'; 

export class PasswordHasher {
  private readonly saltRounds: number = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(plainText: string, hashValue: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashValue);
  }
}

export const passwordHasher = new PasswordHasher();