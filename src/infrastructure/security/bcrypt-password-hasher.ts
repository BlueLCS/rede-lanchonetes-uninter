import bcrypt from "bcryptjs";

class BcryptPasswordHasher {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }
}

export { BcryptPasswordHasher };