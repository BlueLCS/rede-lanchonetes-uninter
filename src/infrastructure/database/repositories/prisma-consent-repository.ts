import type {
  ConsentRepository,
  CreateConsentData
} from "../../../domain/repositories/consent-repository";
import type { Consent } from "../../../domain/entities/consent";
import { prisma } from "../prisma";

export class PrismaConsentRepository implements ConsentRepository {
  async create(data: CreateConsentData): Promise<Consent> {
    return prisma.consentimentoLgpd.create({
      data: {
        usuarioId: data.usuarioId,
        finalidade: data.finalidade,
        aceito: data.aceito,
        versaoTermo: data.versaoTermo,
        ip: data.ip
      }
    });
  }

  async findLatestByUserAndPurpose(
    usuarioId: string,
    finalidade: string
  ): Promise<Consent | null> {
    return prisma.consentimentoLgpd.findFirst({
      where: {
        usuarioId,
        finalidade
      },
      orderBy: {
        registradoEm: "desc"
      }
    });
  }
}