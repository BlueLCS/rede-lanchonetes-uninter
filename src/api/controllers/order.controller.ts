import { NextFunction, Request, Response } from "express";
import { CreateOrderUseCase } from "../../application/usecases/create-order.use-case";
import type { AuthenticatedUser } from "../../infrastructure/security/jwt-token-service";

class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase
  ) {}

  create = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const pedido = await this.createOrderUseCase.execute(
        request.body,
        {
          userId: auth.userId,
          perfil: auth.perfil
        }
      );

      response.status(201).json(pedido);
    } catch (error) {
      next(error);
    }
  };
}

export { OrderController };