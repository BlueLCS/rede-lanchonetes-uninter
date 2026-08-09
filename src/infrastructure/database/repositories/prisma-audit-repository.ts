import type {
  AuditRepository,
  CreateAuditData
} from "../../../domain/repositories/audit-repository";
import { prisma } from "../prisma";

export class PrismaAuditRepository implements AuditRepository {
  async create(data: CreateAuditData): Promise<void> {
    await prisma.logAuditoria.create({
      data: {
        usuarioId: data.usuarioId,
        requestId: data.requestId,
        acao: data.acao,
        entidade: data.entidade,
        entidadeId: data.entidadeId,
        dados: {
            statusHttp: data.dados.statusHttp,
            rota: data.dados.rota,
            resultado: data.dados.resultado
        },
        ip: data.ip
      }
    });
  }
}