import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session-repository";

type RefreshTokenHasher = {
  hash(token: string): string;
};

class LogoutUserUseCase {
  constructor(
    private readonly sessionRepository: RefreshSessionRepository,
    private readonly refreshTokenHasher: RefreshTokenHasher
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const tokenHash = this.refreshTokenHasher.hash(refreshToken);

    const session =
      await this.sessionRepository.findByTokenHash(tokenHash);

    if (session && !session.revogadoEm) {
      await this.sessionRepository.revoke(session.id);
    }
  }
}

export { LogoutUserUseCase };