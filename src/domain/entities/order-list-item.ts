import { OrderChannel } from "../enums/order-channel";
import { OrderStatus } from "../enums/order-status";

type OrderListItem = {
  id: string;
  clienteId: string;
  unidadeId: string;
  canalPedido: OrderChannel;
  status: OrderStatus;
  formaPagamento: string;
  subtotal: number;
  desconto: number;
  valorTotal: number;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type { OrderListItem };