import type { LoyaltyAccount } from "../entities/loyalty-account";

export interface RedeemPointsData {
  contaId: string;
  pontos: number;
  saldoAnterior: number;
  saldoPosterior: number;
}

export interface CreditPointsData {
  contaId: string;
  pedidoId: string;
  pontos: number;
  saldoAnterior: number;
  saldoPosterior: number;
}

export interface LoyaltyOrderData {
  id: string;
  clienteId: string;
  status: string;
  valorTotal: number;
}

export interface LoyaltyRepository {
  getOrCreateByUserId(usuarioId: string): Promise<LoyaltyAccount>;

  redeemPoints(data: RedeemPointsData): Promise<LoyaltyAccount>;

  findOrderForCredit(
    pedidoId: string
  ): Promise<LoyaltyOrderData | null>;

  hasCreditForOrder(pedidoId: string): Promise<boolean>;

  creditPoints(data: CreditPointsData): Promise<LoyaltyAccount>;
}