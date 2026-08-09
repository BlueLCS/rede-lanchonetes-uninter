import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "../../domain/enums/user-role";

type GenerateTokenData = {
  userId: string;
  perfil: UserRole;
  unidadeId: string | null;
};

class JwtTokenService {
  private readonly secret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("A variável JWT_SECRET não foi configurada.");
    }

    this.secret = secret;
  }

  generate(data: GenerateTokenData): string {
    const expiresIn = (
      process.env.JWT_EXPIRES_IN || "15m"
    ) as SignOptions["expiresIn"];

    return jwt.sign(
      {
        perfil: data.perfil,
        unidadeId: data.unidadeId
      },
      this.secret,
      {
        algorithm: "HS256",
        expiresIn,
        subject: data.userId,
        issuer: "rede-lanchonetes-api",
        audience: "rede-lanchonetes-client"
      }
    );
  }
}

export { JwtTokenService };