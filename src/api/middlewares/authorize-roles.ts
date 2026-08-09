import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../domain/enums/user-role";
import type { AuthenticatedUser } from "../../infrastructure/security/jwt-token-service";
import { AppError } from "../../shared/errors/app-error";

function authorizeRoles(...allowedRoles: UserRole[]) {
  return (
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const auth = response.locals.auth as
      | AuthenticatedUser
      | undefined;

    if (!auth) {
      next(
        new AppError(
          401,
          "USUARIO_NAO_AUTENTICADO",
          "O usuário não foi autenticado."
        )
      );

      return;
    }

    if (!allowedRoles.includes(auth.perfil)) {
      next(
        new AppError(
          403,
          "PERFIL_SEM_PERMISSAO",
          "Seu perfil não possui permissão para esta operação."
        )
      );

      return;
    }

    next();
  };
}

export { authorizeRoles };