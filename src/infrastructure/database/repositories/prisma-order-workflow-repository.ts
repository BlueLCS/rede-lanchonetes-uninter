import { OrderStatus } from "../../../domain/enums/order-status";
import type {
  CancelOrderData,
  OrderWorkflowRepository,
  OrderWorkflowResult,
  UpdateOrderStatusData
} from "../../../domain/repositories/order-workflow-repository";
import {
  StatusPagamento as PrismaPaymentStatus,
  StatusPedido as PrismaOrderStatus,
  TipoMovimentacaoEstoque as PrismaMovementType
} from "../../../generated/prisma/client";
import { prisma } from "../prisma";

class PrismaOrderWorkflowRepository
  implements OrderWorkflowRepository
{
  async updateStatus(
    data: UpdateOrderStatusData
  ): Promise<OrderWorkflowResult> {
    return prisma.$transaction(async (transaction) => {
      const pedido = await transaction.pedido.update({
        where: {
          id: data.pedidoId
        },
        data: {
          status: data.statusNovo as PrismaOrderStatus,
          entregueEm:
            data.statusNovo === OrderStatus.ENTREGUE
              ? new Date()
              : undefined
        }
      });

      await transaction.historicoStatusPedido.create({
        data: {
          pedidoId: data.pedidoId,
          usuarioId: data.usuarioId,
          statusAnterior:
            data.statusAnterior as PrismaOrderStatus,
          statusNovo: data.statusNovo as PrismaOrderStatus,
          motivo: data.motivo
        }
      });

      return {
        id: pedido.id,
        status: pedido.status as OrderStatus,
        canceladoEm: pedido.canceladoEm,
        entregueEm: pedido.entregueEm,
        atualizadoEm: pedido.atualizadoEm
      };
    });
  }

  async cancel(
    data: CancelOrderData
  ): Promise<OrderWorkflowResult> {
    return prisma.$transaction(async (transaction) => {
      const pedido = await transaction.pedido.findUnique({
        where: {
          id: data.pedidoId
        }
      });

      if (!pedido) {
        throw new Error("Pedido não encontrado.");
      }

      const itens = await transaction.itemPedido.findMany({
        where: {
          pedidoId: data.pedidoId
        }
      });

      for (const item of itens) {
        const estoque = await transaction.estoque.findUnique({
          where: {
            unidadeId_produtoId: {
              unidadeId: pedido.unidadeId,
              produtoId: item.produtoId
            }
          }
        });

        if (!estoque) {
          throw new Error(
            "Estoque do produto não encontrado."
          );
        }

        const estavaReservado =
          data.statusAnterior ===
          OrderStatus.AGUARDANDO_PAGAMENTO;

        if (
          estavaReservado &&
          estoque.quantidadeReservada < item.quantidade
        ) {
          throw new Error(
            "A reserva de estoque está inconsistente."
          );
        }

        const saldoAnterior =
          estoque.quantidadeDisponivel;

        const saldoPosterior =
          saldoAnterior + item.quantidade;

        if (estavaReservado) {
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
        } else {
          await transaction.estoque.update({
            where: {
              id: estoque.id
            },
            data: {
              quantidadeDisponivel: {
                increment: item.quantidade
              }
            }
          });
        }

        await transaction.movimentacaoEstoque.create({
          data: {
            estoqueId: estoque.id,
            pedidoId: pedido.id,
            usuarioId: data.usuarioId,
            tipo: PrismaMovementType.ESTORNO,
            quantidade: item.quantidade,
            saldoAnterior,
            saldoPosterior,
            motivo: `Cancelamento do pedido: ${data.motivo}`
          }
        });
      }

      await transaction.pagamento.updateMany({
        where: {
          pedidoId: data.pedidoId
        },
        data: {
          status: PrismaPaymentStatus.CANCELADO
        }
      });

      const pedidoCancelado =
        await transaction.pedido.update({
          where: {
            id: data.pedidoId
          },
          data: {
            status: PrismaOrderStatus.CANCELADO,
            canceladoEm: new Date()
          }
        });

      await transaction.historicoStatusPedido.create({
        data: {
          pedidoId: data.pedidoId,
          usuarioId: data.usuarioId,
          statusAnterior:
            data.statusAnterior as PrismaOrderStatus,
          statusNovo: PrismaOrderStatus.CANCELADO,
          motivo: data.motivo
        }
      });

      return {
        id: pedidoCancelado.id,
        status: pedidoCancelado.status as OrderStatus,
        canceladoEm: pedidoCancelado.canceladoEm,
        entregueEm: pedidoCancelado.entregueEm,
        atualizadoEm: pedidoCancelado.atualizadoEm
      };
    });
  }
}

export { PrismaOrderWorkflowRepository };