import { NextFunction, Request, Response } from "express";
import { CancelOrderUseCase } from "../../application/usecases/cancel-order.use-case";
import { CreateOrderUseCase } from "../../application/usecases/create-order.use-case";
import { GetOrderPaymentUseCase } from "../../application/usecases/get-order-payment.use-case";
import { ListOrdersUseCase } from "../../application/usecases/list-orders.use-case";
import { UpdateOrderStatusUseCase } from "../../application/usecases/update-order-status.use-case";
import type { AuthenticatedUser } from "../../infrastructure/security/jwt-token-service";

class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderPaymentUseCase: GetOrderPaymentUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase
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

  list = async (
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const result = await this.listOrdersUseCase.execute(
        response.locals.validatedQuery,
        {
          userId: auth.userId,
          perfil: auth.perfil,
          unidadeId: auth.unidadeId
        }
      );

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPayment = async (
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const pagamento =
        await this.getOrderPaymentUseCase.execute(
          response.locals.validatedParams.pedidoId,
          {
            userId: auth.userId,
            perfil: auth.perfil,
            unidadeId: auth.unidadeId
          }
        );

      response.status(200).json(pagamento);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const result =
        await this.updateOrderStatusUseCase.execute(
          response.locals.validatedParams.id,
          request.body,
          {
            userId: auth.userId,
            perfil: auth.perfil,
            unidadeId: auth.unidadeId
          }
        );

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  cancel = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const result = await this.cancelOrderUseCase.execute(
        response.locals.validatedParams.id,
        request.body.motivo,
        {
          userId: auth.userId,
          perfil: auth.perfil,
          unidadeId: auth.unidadeId
        }
      );

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export { OrderController };