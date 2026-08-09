import { NextFunction, Request, Response } from "express";
import { CreateUnitUseCase } from "../../application/usecases/create-unit.use-case";
import { ListUnitsUseCase } from "../../application/usecases/list-units.use-case";
import { UpdateUnitUseCase } from "../../application/usecases/update-unit.use-case";
import type { AuthenticatedUser } from "../../infrastructure/security/jwt-token-service";

class UnitController {
  constructor(
    private readonly listUnitsUseCase: ListUnitsUseCase,
    private readonly createUnitUseCase: CreateUnitUseCase,
    private readonly updateUnitUseCase: UpdateUnitUseCase
  ) {}

  list = async (
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const query = response.locals.validatedQuery;

      const result = await this.listUnitsUseCase.execute(
        query.page,
        query.limit
      );

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const unidade = await this.createUnitUseCase.execute(
        request.body
      );

      response.status(201).json(unidade);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const unidade = await this.updateUnitUseCase.execute(
        response.locals.validatedParams.id,
        request.body,
        {
          perfil: auth.perfil,
          unidadeId: auth.unidadeId
        }
      );

      response.status(200).json(unidade);
    } catch (error) {
      next(error);
    }
  };
}

export { UnitController };