import type { LoyaltyAccount } from "../entities/loyalty-account";

export interface RedeemPointsData {
  contaId: string;
  pontos: number;
  saldoAnterior: number;
  saldoPosterior: number;
}

export interface LoyaltyRepository {
  getOrCreateByUserId(usuarioId: string): Promise<LoyaltyAccount>;

  redeemPoints(data: RedeemPointsData): Promise<LoyaltyAccount>;
}