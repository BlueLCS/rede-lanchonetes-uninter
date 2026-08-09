import { OrderChannel } from "../enums/order-channel";
import { OrderStatus } from "../enums/order-status";

type OrderItem = {
  id: string;
  pedidoId: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

type Order = {
  id: string;
  clienteId: string;
  unidadeId: string;
  promocaoId: string | null;
  canalPedido: OrderChannel;
  status: OrderStatus;
  formaPagamento: string;
  subtotal: number;
  desconto: number;
  valorTotal: number;
  canceladoEm: Date | null;
  entregueEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
  itens: OrderItem[];
};

export type { Order, OrderItem };