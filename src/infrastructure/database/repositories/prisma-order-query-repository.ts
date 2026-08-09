import type { OrderListItem } from "../../../domain/entities/order-list-item";
import type {
  Order,
  OrderItem
} from "../../../domain/entities/order";
import { OrderChannel } from "../../../domain/enums/order-channel";
import { OrderStatus } from "../../../domain/enums/order-status";
import type {
  ListOrdersResult,
  OrderFilters,
  OrderQueryRepository
} from "../../../domain/repositories/order-query-repository";
import {
  CanalPedido as PrismaOrderChannel,
  Prisma,
  StatusPedido as PrismaOrderStatus
} from "../../../generated/prisma/client";
import { prisma } from "../prisma";

type PrismaOrderData = {
  id: string;
  clienteId: string;
  unidadeId: string;
  promocaoId: string | null;
  canalPedido: string;
  status: string;
  formaPagamento: string;
  subtotal: {
    toString(): string;
  };
  desconto: {
    toString(): string;
  };
  valorTotal: {
    toString(): string;
  };
  canceladoEm: Date | null;
  entregueEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
};

function mapOrderListItem(
  pedido: PrismaOrderData
): OrderListItem {
  return {
    id: pedido.id,
    clienteId: pedido.clienteId,
    unidadeId: pedido.unidadeId,
    canalPedido: pedido.canalPedido as OrderChannel,
    status: pedido.status as OrderStatus,
    formaPagamento: pedido.formaPagamento,
    subtotal: Number(pedido.subtotal.toString()),
    desconto: Number(pedido.desconto.toString()),
    valorTotal: Number(pedido.valorTotal.toString()),
    criadoEm: pedido.criadoEm,
    atualizadoEm: pedido.atualizadoEm
  };
}

class PrismaOrderQueryRepository
  implements OrderQueryRepository
{
  async findById(id: string): Promise<Order | null> {
    const pedido = await prisma.pedido.findUnique({
      where: {
        id
      }
    });

    if (!pedido) {
      return null;
    }

    const itens = await prisma.itemPedido.findMany({
      where: {
        pedidoId: id
      },
      include: {
        produto: true
      },
      orderBy: {
        criadoEm: "asc"
      }
    });

    const orderItems: OrderItem[] = itens.map((item) => ({
      id: item.id,
      pedidoId: item.pedidoId,
      produtoId: item.produtoId,
      produtoNome: item.produto.nome,
      quantidade: item.quantidade,
      precoUnitario: Number(item.precoUnitario.toString()),
      subtotal: Number(item.subtotal.toString())
    }));

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
      itens: orderItems
    };
  }

  async list(
    filters: OrderFilters
  ): Promise<ListOrdersResult> {
    const where: Prisma.PedidoWhereInput = {
      canalPedido: filters.canalPedido
        ? (filters.canalPedido as PrismaOrderChannel)
        : undefined,
      status: filters.status
        ? (filters.status as PrismaOrderStatus)
        : undefined,
      unidadeId: filters.unidadeId,
      clienteId: filters.clienteId
    };

    const [pedidos, total] = await prisma.$transaction([
      prisma.pedido.findMany({
        where,
        orderBy: {
          criadoEm: "desc"
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.pedido.count({
        where
      })
    ]);

    return {
      items: pedidos.map(mapOrderListItem),
      total
    };
  }
}

export { PrismaOrderQueryRepository };