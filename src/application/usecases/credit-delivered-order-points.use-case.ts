import { OrderStatus } from "../../domain/enums/order-status";
import type { ConsentRepository } from "../../domain/repositories/consent-repository";
import type { LoyaltyRepository } from "../../domain/repositories/loyalty-repository";

export class CreditDeliveredOrderPointsUseCase {
  constructor(
    private readonly loyaltyRepository: LoyaltyRepository,
    private readonly consentRepository: ConsentRepository
  ) {}

  async execute(pedidoId: string) {
    const order =
      await this.loyaltyRepository.findOrderForCredit(pedidoId);

    if (!order || order.status !== OrderStatus.ENTREGUE) {
      return null;
    }

    const consent =
      await this.consentRepository.findLatestByUserAndPurpose(
        order.clienteId,
        "PROGRAMA_FIDELIDADE"
      );

    if (!consent?.aceito) {
      return null;
    }

    const alreadyCredited =
      await this.loyaltyRepository.hasCreditForOrder(pedidoId);

    if (alreadyCredited) {
      return null;
    }

    const points = Math.floor(order.valorTotal);

    if (points <= 0) {
      return null;
    }

    const account =
      await this.loyaltyRepository.getOrCreateByUserId(
        order.clienteId
      );

    return this.loyaltyRepository.creditPoints({
      contaId: account.id,
      pedidoId,
      pontos: points,
      saldoAnterior: account.saldoPontos,
      saldoPosterior: account.saldoPontos + points
    });
  }
}