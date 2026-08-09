import { GetLoyaltyBalanceUseCase } from "../../application/usecases/get-loyalty-balance.use-case";
import { RedeemLoyaltyPointsUseCase } from "../../application/usecases/redeem-loyalty-points.use-case";
import { LoyaltyController } from "../../api/controllers/loyalty.controller";
import { PrismaConsentRepository } from "../../infrastructure/database/repositories/prisma-consent-repository";
import { PrismaLoyaltyRepository } from "../../infrastructure/database/repositories/prisma-loyalty-repository";

export function makeLoyaltyController() {
  const loyaltyRepository = new PrismaLoyaltyRepository();
  const consentRepository = new PrismaConsentRepository();

  const getLoyaltyBalanceUseCase =
    new GetLoyaltyBalanceUseCase(
      loyaltyRepository,
      consentRepository
    );

  const redeemLoyaltyPointsUseCase =
    new RedeemLoyaltyPointsUseCase(
      loyaltyRepository,
      consentRepository
    );

  return new LoyaltyController(
    getLoyaltyBalanceUseCase,
    redeemLoyaltyPointsUseCase
  );
}