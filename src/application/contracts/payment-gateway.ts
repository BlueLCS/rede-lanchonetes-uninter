import { OrderChannel } from "../../domain/enums/order-channel";
import { PaymentStatus } from "../../domain/enums/payment-status";

type PaymentGatewayRequest = {
  pedidoId: string;
  valor: number;
  formaPagamento: string;
  canalPedido: OrderChannel;
};

type PaymentGatewayResult = {
  status: PaymentStatus.APROVADO | PaymentStatus.RECUSADO;
  transacaoExternaId: string;
  payloadEnvio: Record<string, unknown>;
  payloadRetorno: Record<string, unknown>;
};

interface PaymentGateway {
  requestPayment(
    data: PaymentGatewayRequest
  ): Promise<PaymentGatewayResult>;
}

export type {
  PaymentGateway,
  PaymentGatewayRequest,
  PaymentGatewayResult
};