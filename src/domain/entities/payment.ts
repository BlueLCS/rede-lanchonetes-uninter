import { PaymentStatus } from "../enums/payment-status";

type Payment = {
  id: string;
  pedidoId: string;
  provedor: string;
  status: PaymentStatus;
  valor: number;
  transacaoExternaId: string | null;
  payloadEnvio: unknown;
  payloadRetorno: unknown;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type { Payment };