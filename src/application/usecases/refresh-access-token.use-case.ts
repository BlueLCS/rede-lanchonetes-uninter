import { UserRole } from "../../domain/enums/user-role";
import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session-repository";
import type { UserRepository } from "../../domain/repositories/user-repository";
import { AppError } from "../../shared/errors/app-error";

type TokenService = {
  generate(data: {
    userId: string;
    perfil: UserRole;
    unidadeId: string | null;
  }): string;
};

type RefreshTokenManager = {
  hash(token: string): string;
  generate(): {
    token: string;
    tokenHash: string;
    expiresAt: Date;
  };
};

function invalidRefreshTokenError() {
  return new AppError(
    401,
    "REFRESH_TOKEN_INVALIDO",
    "O refresh token é inválido, expirou ou foi revogado."
  );
}

class RefreshAccessTokenUseCase {
  constructor(
    private readonly sessionRepository: RefreshSessionRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenManager: RefreshTokenManager
  ) {}

  async execute(refreshToken: string) {
    const tokenHash = this.refreshTokenManager.hash(refreshToken);

    const session =
      await this.sessionRepository.findByTokenHash(tokenHash);

    if (
      !session ||
      session.revogadoEm ||
      session.expiraEm.getTime() <= Date.now()
    ) {
      throw invalidRefreshTokenError();
    }

    const usuario = await this.userRepository.findById(
      session.usuarioId
    );

    if (!usuario || !usuario.ativo) {
      throw invalidRefreshTokenError();
    }

    await this.sessionRepository.revoke(session.id);

    const newRefresh = this.refreshTokenManager.generate();

    await this.sessionRepository.create({
      usuarioId: usuario.id,
      tokenHash: newRefresh.tokenHash,
      expiraEm: newRefresh.expiresAt
    });

    const accessToken = this.tokenService.generate({
      userId: usuario.id,
      perfil: usuario.perfil,
      unidadeId: usuario.unidadeId
    });

    return {
      accessToken,
      refreshToken: newRefresh.token,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m"
    };
  }
}

export { RefreshAccessTokenUseCase };