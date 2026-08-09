type RefreshSession = {
  id: string;
  usuarioId: string;
  tokenHash: string;
  expiraEm: Date;
  revogadoEm: Date | null;
  criadoEm: Date;
};

type CreateRefreshSessionData = {
  usuarioId: string;
  tokenHash: string;
  expiraEm: Date;
};

interface RefreshSessionRepository {
  create(data: CreateRefreshSessionData): Promise<RefreshSession>;
  findByTokenHash(tokenHash: string): Promise<RefreshSession | null>;
  revoke(id: string): Promise<void>;
}

export type {
  CreateRefreshSessionData,
  RefreshSession,
  RefreshSessionRepository
};