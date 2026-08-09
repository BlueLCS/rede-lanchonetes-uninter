import type {
  CreateRefreshSessionData,
  RefreshSession,
  RefreshSessionRepository
} from "../../../domain/repositories/refresh-session-repository";
import { prisma } from "../prisma";

class PrismaRefreshSessionRepository
  implements RefreshSessionRepository
{
  async create(
    data: CreateRefreshSessionData
  ): Promise<RefreshSession> {
    return prisma.sessaoRefresh.create({
      data: {
        usuarioId: data.usuarioId,
        tokenHash: data.tokenHash,
        expiraEm: data.expiraEm
      }
    });
  }

  async findByTokenHash(
    tokenHash: string
  ): Promise<RefreshSession | null> {
    return prisma.sessaoRefresh.findUnique({
      where: {
        tokenHash
      }
    });
  }

  async revoke(id: string): Promise<void> {
    await prisma.sessaoRefresh.update({
      where: {
        id
      },
      data: {
        revogadoEm: new Date()
      }
    });
  }
}

export { PrismaRefreshSessionRepository };