import type { Request, Response } from "express";
import type { GetLoyaltyBalanceUseCase } from "../../application/usecases/get-loyalty-balance.use-case";
import type { RedeemLoyaltyPointsUseCase } from "../../application/usecases/redeem-loyalty-points.use-case";

export class LoyaltyController {
  constructor(
    private readonly getLoyaltyBalanceUseCase: GetLoyaltyBalanceUseCase,
    private readonly redeemLoyaltyPointsUseCase: RedeemLoyaltyPointsUseCase
  ) {}

  balance = async (_request: Request, response: Response) => {
    const account = await this.getLoyaltyBalanceUseCase.execute(
      response.locals.auth.userId
    );

    return response.status(200).json({
      usuarioId: account.usuarioId,
      saldoPontos: account.saldoPontos,
      atualizadoEm: account.atualizadoEm.toISOString()
    });
  };

  redeem = async (request: Request, response: Response) => {
    const account = await this.redeemLoyaltyPointsUseCase.execute({
      usuarioId: response.locals.auth.userId,
      pontos: request.body.pontos
    });

    return response.status(201).json({
      movimentacao: "RESGATE",
      pontosResgatados: request.body.pontos,
      saldoPontos: account.saldoPontos,
      atualizadoEm: account.atualizadoEm.toISOString()
    });
  };
}