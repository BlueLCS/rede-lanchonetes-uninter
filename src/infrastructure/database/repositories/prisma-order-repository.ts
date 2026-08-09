import { StockReservationError } from "../../../domain/errors/stock-reservation-error";
import type {
  Order,
  OrderItem
} from "../../../domain/entities/order";
import { OrderChannel } from "../../../domain/enums/order-channel";
import { OrderStatus } from "../../../domain/enums/order-status";
import type {
  CreateOrderData,
  OrderRepository
} from "../../../domain/repositories/order-repository";
import {
  CanalPedido as PrismaOrderChannel,
  StatusPedido as PrismaOrderStatus,
  TipoMovimentacaoEstoque as PrismaMovementType
} from "../../../generated/prisma/client";
import { prisma } from "../prisma";

class PrismaOrderRepository implements OrderRepository {
  async createWithStockReservation(
    data: CreateOrderData
  ): Promise<Order> {
    return prisma.$transaction(async (transaction) => {
      const pedido = await transaction.pedido.create({
        data: {
          clienteId: data.clienteId,
          unidadeId: data.unidadeId,
          canalPedido: data.canalPedido as PrismaOrderChannel,
          status: PrismaOrderStatus.AGUARDANDO_PAGAMENTO,
          formaPagamento: data.formaPagamento,
          subtotal: data.subtotal,
          desconto: data.desconto,
          valorTotal: data.valorTotal
        }
      });

      const itensCriados: OrderItem[] = [];

      for (const item of data.itens) {
        const estoque = await transaction.estoque.findUnique({
          where: {
            unidadeId_produtoId: {
              unidadeId: data.unidadeId,
              produtoId: item.produtoId
            }
          }
        });

        if (
          !estoque ||
          estoque.quantidadeDisponivel < item.quantidade
        ) {
          throw new StockReservationError(item.produtoId);
        }

        const saldoAnterior = estoque.quantidadeDisponivel;
        const saldoPosterior =
          saldoAnterior - item.quantidade;

        await transaction.estoque.update({
          where: {
            id: estoque.id
          },
          data: {
            quantidadeDisponivel: saldoPosterior,
            quantidadeReservada: {
              increment: item.quantidade
            }
          }
        });

        await transaction.movimentacaoEstoque.create({
          data: {
            estoqueId: estoque.id,
            pedidoId: pedido.id,
            usuarioId: data.usuarioOperacaoId,
            tipo: PrismaMovementType.RESERVA,
            quantidade: item.quantidade,
            saldoAnterior,
            saldoPosterior,
            motivo: "Reserva para criação do pedido"
          }
        });

        const itemCriado =
          await transaction.itemPedido.create({
            data: {
              pedidoId: pedido.id,
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              subtotal: item.subtotal
            }
          });

        itensCriados.push({
          id: itemCriado.id,
          pedidoId: itemCriado.pedidoId,
          produtoId: itemCriado.produtoId,
          produtoNome: item.produtoNome,
          quantidade: itemCriado.quantidade,
          precoUnitario: Number(
            itemCriado.precoUnitario.toString()
          ),
          subtotal: Number(itemCriado.subtotal.toString())
        });
      }

      await transaction.historicoStatusPedido.create({
        data: {
          pedidoId: pedido.id,
          usuarioId: data.usuarioOperacaoId,
          statusAnterior: null,
          statusNovo: PrismaOrderStatus.AGUARDANDO_PAGAMENTO,
          motivo: "Pedido criado"
        }
      });

      return {
        id: pedido.id,
        clienteId: pedido.clienteId,
        unidadeId: pedido.unidadeId,
        promocaoId: pedido.promocaoId,
        canalPedido: pedido.canalPedido as OrderChannel,
        status: pedido.status as OrderStatus,
        formaPagamento: pedido.formaPagamento,
        subtotal: Number(pedido.subtotal.toString()),
        desconto: Number(pedido.desconto.toString()),
        valorTotal: Number(pedido.valorTotal.toString()),
        canceladoEm: pedido.canceladoEm,
        entregueEm: pedido.entregueEm,
        criadoEm: pedido.criadoEm,
        atualizadoEm: pedido.atualizadoEm,
        itens: itensCriados
      };
    });
  }
}

export { PrismaOrderRepository };