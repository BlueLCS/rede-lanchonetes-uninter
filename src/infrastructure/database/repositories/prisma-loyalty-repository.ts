import type { LoyaltyAccount } from "../../../domain/entities/loyalty-account";
import type {
  CreditPointsData,
  LoyaltyOrderData,
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

  async findOrderForCredit(
    pedidoId: string
  ): Promise<LoyaltyOrderData | null> {
    const pedido = await prisma.pedido.findUnique({
      where: {
        id: pedidoId
      },
      select: {
        id: true,
        clienteId: true,
        status: true,
        valorTotal: true
      }
    });

    if (!pedido) {
      return null;
    }

    return {
      id: pedido.id,
      clienteId: pedido.clienteId,
      status: pedido.status,
      valorTotal: Number(pedido.valorTotal)
    };
  }

  async hasCreditForOrder(pedidoId: string): Promise<boolean> {
    const movement = await prisma.movimentacaoPontos.findFirst({
      where: {
        pedidoId,
        tipo: "CREDITO"
      },
      select: {
        id: true
      }
    });

    return Boolean(movement);
  }

  async creditPoints(
    data: CreditPointsData
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
          pedidoId: data.pedidoId,
          tipo: "CREDITO",
          pontos: data.pontos,
          saldoAnterior: data.saldoAnterior,
          saldoPosterior: data.saldoPosterior,
          descricao: "Pontos recebidos após entrega do pedido"
        }
      });

      return account;
    });
  }
}