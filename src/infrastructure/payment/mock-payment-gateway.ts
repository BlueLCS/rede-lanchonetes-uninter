import { randomUUID } from "node:crypto";
import type {
  PaymentGateway,
  PaymentGatewayRequest,
  PaymentGatewayResult
} from "../../application/contracts/payment-gateway";
import { PaymentStatus } from "../../domain/enums/payment-status";

class MockPaymentGateway implements PaymentGateway {
  async requestPayment(
    data: PaymentGatewayRequest
  ): Promise<PaymentGatewayResult> {
    const approved = data.valor <= 500;
    const transacaoExternaId = `MOCK-${randomUUID()}`;
    const processadoEm = new Date().toISOString();

    const payloadEnvio = {
      pedidoId: data.pedidoId,
      valor: data.valor,
      formaPagamento: data.formaPagamento,
      canalPedido: data.canalPedido,
      enviadoEm: processadoEm
    };

    const payloadRetorno = {
      transacaoId: transacaoExternaId,
      status: approved ? "APROVADO" : "RECUSADO",
      mensagem: approved
        ? "Pagamento aprovado pelo serviço mock."
        : "Pagamento recusado pelo limite do serviço mock.",
      processadoEm
    };

    return {
      status: approved
        ? PaymentStatus.APROVADO
        : PaymentStatus.RECUSADO,
      transacaoExternaId,
      payloadEnvio,
      payloadRetorno
    };
  }
}

export { MockPaymentGateway };