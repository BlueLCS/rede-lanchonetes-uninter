import { NextFunction, Request, Response } from "express";
import { LoginUserUseCase } from "../../application/usecases/login-user.use-case";
import { RegisterUserUseCase } from "../../application/usecases/register-user.use-case";

class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
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
}

export { AuthController };