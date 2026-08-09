import { NextFunction, Request, Response } from "express";
import { ApplyStockMovementUseCase } from "../../application/usecases/apply-stock-movement.use-case";
import { ListStockUseCase } from "../../application/usecases/list-stock.use-case";
import type { AuthenticatedUser } from "../../infrastructure/security/jwt-token-service";

class StockController {
  constructor(
    private readonly listStockUseCase: ListStockUseCase,
    private readonly applyStockMovementUseCase: ApplyStockMovementUseCase
  ) {}

  list = async (
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const query = response.locals.validatedQuery;

      const result = await this.listStockUseCase.execute(
        query.unidadeId,
        query.page,
        query.limit,
        {
          perfil: auth.perfil,
          unidadeId: auth.unidadeId
        }
      );

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  move = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const result =
        await this.applyStockMovementUseCase.execute(
          request.body,
          {
            userId: auth.userId,
            perfil: auth.perfil,
            unidadeId: auth.unidadeId
          }
        );

      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export { StockController };