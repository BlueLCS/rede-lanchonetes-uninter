import { NextFunction, Request, Response } from "express";
import { LoginUserUseCase } from "../../application/usecases/login-user.use-case";
import { LogoutUserUseCase } from "../../application/usecases/logout-user.use-case";
import { RefreshAccessTokenUseCase } from "../../application/usecases/refresh-access-token.use-case";
import { RegisterUserUseCase } from "../../application/usecases/register-user.use-case";

class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase
  ) {}

  register = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const usuario = await this.registerUserUseCase.execute({
        nome: request.body.nome,
        email: request.body.email,
        senha: request.body.senha
      });

      response.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  };

  login = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.loginUserUseCase.execute({
        email: request.body.email,
        senha: request.body.senha
      });

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.refreshAccessTokenUseCase.execute(
        request.body.refreshToken
      );

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      await this.logoutUserUseCase.execute(
        request.body.refreshToken
      );

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export { AuthController };