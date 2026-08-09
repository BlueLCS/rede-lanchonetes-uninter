import { createHash, randomBytes } from "node:crypto";

class RefreshTokenService {
  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  generate() {
    const token = randomBytes(48).toString("hex");
    const tokenHash = this.hash(token);
    const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);

    if (!Number.isInteger(days) || days < 1 || days > 30) {
      throw new Error("A duração do refresh token está inválida.");
    }

    const expiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    );

    return {
      token,
      tokenHash,
      expiresAt
    };
  }
}

export { RefreshTokenService };