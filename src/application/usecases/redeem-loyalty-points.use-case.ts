import type { ConsentRepository } from "../../domain/repositories/consent-repository";
import type { LoyaltyRepository } from "../../domain/repositories/loyalty-repository";
import { AppError } from "../../shared/errors/app-error";

interface RedeemLoyaltyPointsInput {
  usuarioId: string;
  pontos: number;
}

export class RedeemLoyaltyPointsUseCase {
  constructor(
    private readonly loyaltyRepository: LoyaltyRepository,
    private readonly consentRepository: ConsentRepository
  ) {}

  async execute(input: RedeemLoyaltyPointsInput) {
    const consent =
      await this.consentRepository.findLatestByUserAndPurpose(
        input.usuarioId,
        "PROGRAMA_FIDELIDADE"
      );

    if (!consent?.aceito) {
      throw new AppError(
        403,
        "CONSENTIMENTO_FIDELIDADE_NAO_ATIVO",
        "O programa de fidelidade exige consentimento ativo."
      );
    }

    const account =
      await this.loyaltyRepository.getOrCreateByUserId(
        input.usuarioId
      );

    if (account.saldoPontos < input.pontos) {
      throw new AppError(
        409,
        "SALDO_DE_PONTOS_INSUFICIENTE",
        "O cliente não possui pontos suficientes para o resgate."
      );
    }

    return this.loyaltyRepository.redeemPoints({
      contaId: account.id,
      pontos: input.pontos,
      saldoAnterior: account.saldoPontos,
      saldoPosterior: account.saldoPontos - input.pontos
    });
  }
}