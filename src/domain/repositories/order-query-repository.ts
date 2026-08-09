import type { OrderListItem } from "../entities/order-list-item";
import type { Order } from "../entities/order";
import { OrderChannel } from "../enums/order-channel";
import { OrderStatus } from "../enums/order-status";

type OrderFilters = {
  canalPedido?: OrderChannel;
  status?: OrderStatus;
  unidadeId?: string;
  clienteId?: string;
  page: number;
  limit: number;
};

type ListOrdersResult = {
  items: OrderListItem[];
  total: number;
};

interface OrderQueryRepository {
  findById(id: string): Promise<Order | null>;
  list(filters: OrderFilters): Promise<ListOrdersResult>;
}

export type {
  ListOrdersResult,
  OrderFilters,
  OrderQueryRepository
};