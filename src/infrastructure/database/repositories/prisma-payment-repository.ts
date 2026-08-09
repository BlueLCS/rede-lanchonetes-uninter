import type { Payment } from "../../../domain/entities/payment";
import { OrderStatus } from "../../../domain/enums/order-status";
import { PaymentStatus } from "../../../domain/enums/payment-status";
import type {
  PaymentRepository,
  ProcessPaymentData,
  ProcessPaymentResult
} from "../../../domain/repositories/payment-repository";
import {
  Prisma,
  StatusPagamento as PrismaPaymentStatus,
  StatusPedido as PrismaOrderStatus,
  TipoMovimentacaoEstoque as PrismaMovementType
} from "../../../generated/prisma/client";
import { prisma } from "../prisma";

type PrismaPaymentData = {
  id: string;
  pedidoId: string;
  provedor: string;
  status: string;
  valor: {
    toString(): string;
  };
  transacaoExternaId: string | null;
  payloadEnvio: unknown;
  payloadRetorno: unknown;
  criadoEm: Date;
  atualizadoEm: Date;
};

function mapPayment(
  pagamento: PrismaPaymentData
): Payment {
  return {
    id: pagamento.id,
    pedidoId: pagamento.pedidoId,
    provedor: pagamento.provedor,
    status: pagamento.status as PaymentStatus,
    valor: Number(pagamento.valor.toString()),
    transacaoExternaId: pagamento.transacaoExternaId,
    payloadEnvio: pagamento.payloadEnvio,
    payloadRetorno: pagamento.payloadRetorno,
    criadoEm: pagamento.criadoEm,
    atualizadoEm: pagamento.atualizadoEm
  };
}

class PrismaPaymentRepository
  implements PaymentRepository
{
  async process(
    data: ProcessPaymentData
  ): Promise<ProcessPaymentResult> {
    return prisma.$transaction(async (transaction) => {
      const pedido = await transaction.pedido.findUnique({
        where: {
          id: data.pedidoId
        }
      });

      if (
        !pedido ||
        pedido.status !==
          PrismaOrderStatus.AGUARDANDO_PAGAMENTO
      ) {
        throw new Error(
          "O pedido não está aguardando pagamento."
        );
      }

      const itens = await transaction.itemPedido.findMany({
        where: {
          pedidoId: data.pedidoId
        }
      });

      const approved =
        data.status === PaymentStatus.APROVADO;

      for (const item of itens) {
        const estoque = await transaction.estoque.findUnique({
          where: {
            unidadeId_produtoId: {
              unidadeId: pedido.unidadeId,
              produtoId: item.produtoId
            }
          }
        });

        if (
          !estoque ||
          estoque.quantidadeReservada < item.quantidade
        ) {
          throw new Error(
            "A reserva de estoque do pedido está inconsistente."
          );
        }

        if (approved) {
          await transaction.estoque.update({
            where: {
              id: estoque.id
            },
            data: {
              quantidadeReservada: {
                decrement: item.quantidade
              }
            }
          });

          await transaction.movimentacaoEstoque.create({
            data: {
              estoqueId: estoque.id,
              pedidoId: pedido.id,
              usuarioId: data.usuarioId,
              tipo: PrismaMovementType.SAIDA,
              quantidade: item.quantidade,
              saldoAnterior: estoque.quantidadeDisponivel,
              saldoPosterior: estoque.quantidadeDisponivel,
              motivo: "Reserva confirmada após pagamento aprovado"
            }
          });
        } else {
          const saldoPosterior =
            estoque.quantidadeDisponivel +
            item.quantidade;

          await transaction.estoque.update({
            where: {
              id: estoque.id
            },
            data: {
              quantidadeDisponivel: {
                increment: item.quantidade
              },
              quantidadeReservada: {
                decrement: item.quantidade
              }
            }
          });

          await transaction.movimentacaoEstoque.create({
            data: {
              estoqueId: estoque.id,
              pedidoId: pedido.id,
              usuarioId: data.usuarioId,
              tipo: PrismaMovementType.ESTORNO,
              quantidade: item.quantidade,
              saldoAnterior: estoque.quantidadeDisponivel,
              saldoPosterior,
              motivo: "Pagamento mock recusado"
            }
          });
        }
      }

      const statusPedido = approved
        ? PrismaOrderStatus.PAGAMENTO_APROVADO
        : PrismaOrderStatus.CANCELADO;

      await transaction.pedido.update({
        where: {
          id: pedido.id
        },
        data: {
          status: statusPedido,
          canceladoEm: approved ? null : new Date()
        }
      });

      await transaction.historicoStatusPedido.create({
        data: {
          pedidoId: pedido.id,
          usuarioId: data.usuarioId,
          statusAnterior:
            PrismaOrderStatus.AGUARDANDO_PAGAMENTO,
          statusNovo: statusPedido,
          motivo: approved
            ? "Pagamento mock aprovado"
            : "Pagamento mock recusado"
        }
      });

      const pagamento = await transaction.pagamento.create({
        data: {
          pedidoId: pedido.id,
          provedor: "MOCK",
          status: data.status as PrismaPaymentStatus,
          valor: data.valor,
          transacaoExternaId: data.transacaoExternaId,
          payloadEnvio:
            data.payloadEnvio as Prisma.InputJsonValue,
          payloadRetorno:
            data.payloadRetorno as Prisma.InputJsonValue
        }
      });

      return {
        statusPedido: statusPedido as OrderStatus,
        pagamento: mapPayment(pagamento)
      };
    });
  }

  async findByOrderId(
    pedidoId: string
  ): Promise<Payment | null> {
    const pagamento = await prisma.pagamento.findUnique({
      where: {
        pedidoId
      }
    });

    return pagamento ? mapPayment(pagamento) : null;
  }
}

export { PrismaPaymentRepository };