import type { LoyaltyAccount } from "../../../domain/entities/loyalty-account";
import type {
  LoyaltyRepository,
  RedeemPointsData
} from "../../../domain/repositories/loyalty-repository";
import { prisma } from "../prisma";

export class PrismaLoyaltyRepository implements LoyaltyRepository {
  async getOrCreateByUserId(
    usuarioId: string
  ): Promise<LoyaltyAccount> {
    return prisma.contaFidelidade.upsert({
      where: {
        usuarioId
      },
      update: {},
      create: {
        usuarioId
      }
    });
  }

  async redeemPoints(
    data: RedeemPointsData
  ): Promise<LoyaltyAccount> {
    return prisma.$transaction(async (transaction) => {
      const account = await transaction.contaFidelidade.update({
        where: {
          id: data.contaId
        },
        data: {
          saldoPontos: data.saldoPosterior
        }
      });

      await transaction.movimentacaoPontos.create({
        data: {
          contaId: data.contaId,
          tipo: "RESGATE",
          pontos: data.pontos,
          saldoAnterior: data.saldoAnterior,
          saldoPosterior: data.saldoPosterior,
          descricao: "Resgate realizado pelo cliente"
        }
      });

      return account;
    });
  }
}