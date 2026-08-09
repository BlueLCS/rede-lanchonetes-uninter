import type { ConsentRepository } from "../../domain/repositories/consent-repository";
import type { LoyaltyRepository } from "../../domain/repositories/loyalty-repository";
import { AppError } from "../../shared/errors/app-error";

export class GetLoyaltyBalanceUseCase {
  constructor(
    private readonly loyaltyRepository: LoyaltyRepository,
    private readonly consentRepository: ConsentRepository
  ) {}

  async execute(usuarioId: string) {
    const consent =
      await this.consentRepository.findLatestByUserAndPurpose(
        usuarioId,
        "PROGRAMA_FIDELIDADE"
      );

    if (!consent?.aceito) {
      throw new AppError(
        403,
        "CONSENTIMENTO_FIDELIDADE_NAO_ATIVO",
        "O programa de fidelidade exige consentimento ativo."
      );
    }

    return this.loyaltyRepository.getOrCreateByUserId(usuarioId);
  }
}