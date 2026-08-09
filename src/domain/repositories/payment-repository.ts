import type { Payment } from "../entities/payment";
import { OrderStatus } from "../enums/order-status";
import { PaymentStatus } from "../enums/payment-status";

type ProcessPaymentData = {
  pedidoId: string;
  usuarioId: string;
  valor: number;
  status: PaymentStatus.APROVADO | PaymentStatus.RECUSADO;
  transacaoExternaId: string;
  payloadEnvio: Record<string, unknown>;
  payloadRetorno: Record<string, unknown>;
};

type ProcessPaymentResult = {
  statusPedido: OrderStatus;
  pagamento: Payment;
};

interface PaymentRepository {
  process(
    data: ProcessPaymentData
  ): Promise<ProcessPaymentResult>;

  findByOrderId(pedidoId: string): Promise<Payment | null>;
}

export type {
  PaymentRepository,
  ProcessPaymentData,
  ProcessPaymentResult
};