import { NextFunction, Request, Response } from "express";
import { RegisterUserUseCase } from "../../application/usecases/register-user.use-case";

class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase
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
}

export { AuthController };