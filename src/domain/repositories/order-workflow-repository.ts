import { OrderStatus } from "../enums/order-status";

type UpdateOrderStatusData = {
  pedidoId: string;
  usuarioId: string;
  statusAnterior: OrderStatus;
  statusNovo: OrderStatus;
  motivo: string;
};

type CancelOrderData = {
  pedidoId: string;
  usuarioId: string;
  statusAnterior: OrderStatus;
  motivo: string;
};

type OrderWorkflowResult = {
  id: string;
  status: OrderStatus;
  canceladoEm: Date | null;
  entregueEm: Date | null;
  atualizadoEm: Date;
};

interface OrderWorkflowRepository {
  updateStatus(
    data: UpdateOrderStatusData
  ): Promise<OrderWorkflowResult>;

  cancel(
    data: CancelOrderData
  ): Promise<OrderWorkflowResult>;
}

export type {
  CancelOrderData,
  OrderWorkflowRepository,
  OrderWorkflowResult,
  UpdateOrderStatusData
};