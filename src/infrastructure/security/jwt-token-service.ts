import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "../../domain/enums/user-role";

type GenerateTokenData = {
  userId: string;
  perfil: UserRole;
  unidadeId: string | null;
};

type AuthenticatedUser = {
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

  verify(token: string): AuthenticatedUser {
    const payload = jwt.verify(token, this.secret, {
      algorithms: ["HS256"],
      issuer: "rede-lanchonetes-api",
      audience: "rede-lanchonetes-client"
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.perfil !== "string"
    ) {
      throw new Error("Token com conteúdo inválido.");
    }

    const validRoles = Object.values(UserRole);
    const perfil = payload.perfil as UserRole;

    if (!validRoles.includes(perfil)) {
      throw new Error("Perfil do token inválido.");
    }

    if (
      payload.unidadeId !== null &&
      typeof payload.unidadeId !== "string"
    ) {
      throw new Error("Unidade do token inválida.");
    }

    return {
      userId: payload.sub,
      perfil,
      unidadeId: payload.unidadeId
    };
  }
}

export { JwtTokenService };
export type { AuthenticatedUser };