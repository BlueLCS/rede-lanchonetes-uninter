import type { ConsentRepository } from "../../domain/repositories/consent-repository";

interface RegisterConsentInput {
  usuarioId: string;
  finalidade: string;
  aceito: boolean;
  versaoTermo: string;
  ip: string | null;
}

export class RegisterConsentUseCase {
  constructor(
    private readonly consentRepository: ConsentRepository
  ) {}

  async execute(input: RegisterConsentInput) {
    return this.consentRepository.create({
      usuarioId: input.usuarioId,
      finalidade: input.finalidade,
      aceito: input.aceito,
      versaoTermo: input.versaoTermo,
      ip: input.ip
    });
  }
}