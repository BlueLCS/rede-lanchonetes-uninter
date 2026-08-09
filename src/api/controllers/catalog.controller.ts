import { NextFunction, Request, Response } from "express";
import { CreateProductUseCase } from "../../application/usecases/create-product.use-case";
import { ListMenuUseCase } from "../../application/usecases/list-menu.use-case";
import { SetMenuItemUseCase } from "../../application/usecases/set-menu-item.use-case";
import type { AuthenticatedUser } from "../../infrastructure/security/jwt-token-service";

class CatalogController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listMenuUseCase: ListMenuUseCase,
    private readonly setMenuItemUseCase: SetMenuItemUseCase
  ) {}

  createProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const produto =
        await this.createProductUseCase.execute(request.body);

      response.status(201).json(produto);
    } catch (error) {
      next(error);
    }
  };

  listMenu = async (
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const params = response.locals.validatedParams;
      const query = response.locals.validatedQuery;

      const result = await this.listMenuUseCase.execute(
        params.unidadeId,
        query.page,
        query.limit
      );

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  setMenuItem = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const auth =
        response.locals.auth as AuthenticatedUser;

      const params = response.locals.validatedParams;

      const item = await this.setMenuItemUseCase.execute(
        {
          unidadeId: params.unidadeId,
          produtoId: params.produtoId,
          preco: request.body.preco,
          disponivel: request.body.disponivel
        },
        {
          perfil: auth.perfil,
          unidadeId: auth.unidadeId
        }
      );

      response.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };
}

export { CatalogController };