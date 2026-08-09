import { NextFunction, Request, Response } from "express";
import { JwtTokenService } from "../../infrastructure/security/jwt-token-service";
import { AppError } from "../../shared/errors/app-error";

const tokenService = new JwtTokenService();

function authenticate(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorization = request.get("authorization");
  const [scheme, token] = authorization?.split(" ") || [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    next(
      new AppError(
        401,
        "TOKEN_NAO_INFORMADO",
        "Informe um token de autenticação."
      )
    );

    return;
  }

  try {
    response.locals.auth = tokenService.verify(token);
    next();
  } catch {
    next(
      new AppError(
        401,
        "TOKEN_INVALIDO",
        "O token informado é inválido ou expirou."
      )
    );
  }
}

export { authenticate };