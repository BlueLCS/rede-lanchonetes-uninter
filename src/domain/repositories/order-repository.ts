import type { Order } from "../entities/order";
import { OrderChannel } from "../enums/order-channel";

type CreateOrderItemData = {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

type CreateOrderData = {
  clienteId: string;
  unidadeId: string;
  canalPedido: OrderChannel;
  formaPagamento: string;
  subtotal: number;
  desconto: number;
  valorTotal: number;
  usuarioOperacaoId: string;
  itens: CreateOrderItemData[];
};

interface OrderRepository {
  createWithStockReservation(
    data: CreateOrderData
  ): Promise<Order>;
}

export type {
  CreateOrderData,
  CreateOrderItemData,
  OrderRepository
};