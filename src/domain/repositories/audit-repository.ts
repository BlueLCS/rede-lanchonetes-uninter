export interface AuditDetails {
  statusHttp: number;
  rota: string;
  resultado: "SUCESSO" | "ERRO";
}

export interface CreateAuditData {
  usuarioId: string | null;
  requestId: string | null;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  dados: AuditDetails;
  ip: string | null;
}

export interface AuditRepository {
  create(data: CreateAuditData): Promise<void>;
}