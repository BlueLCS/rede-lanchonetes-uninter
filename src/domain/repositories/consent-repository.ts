import type { Consent } from "../entities/consent";

export interface CreateConsentData {
  usuarioId: string;
  finalidade: string;
  aceito: boolean;
  versaoTermo: string;
  ip: string | null;
}

export interface ConsentRepository {
  create(data: CreateConsentData): Promise<Consent>;

  findLatestByUserAndPurpose(
    usuarioId: string,
    finalidade: string
  ): Promise<Consent | null>;
}