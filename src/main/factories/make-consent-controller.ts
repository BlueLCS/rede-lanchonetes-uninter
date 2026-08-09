import { RegisterConsentUseCase } from "../../application/usecases/register-consent.use-case";
import { ConsentController } from "../../api/controllers/consent.controller";
import { PrismaConsentRepository } from "../../infrastructure/database/repositories/prisma-consent-repository";

export function makeConsentController() {
  const consentRepository = new PrismaConsentRepository();

  const registerConsentUseCase = new RegisterConsentUseCase(
    consentRepository
  );

  return new ConsentController(registerConsentUseCase);
}