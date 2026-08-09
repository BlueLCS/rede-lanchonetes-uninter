import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../../shared/errors/app-error";

function validateParams(schema: ZodType) {
  return (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(request.params);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.map(String).join(".") || "params",
        issue: issue.message
      }));

      next(
        new AppError(
          422,
          "PARAMETROS_INVALIDOS",
          "Os parâmetros da rota são inválidos.",
          details
        )
      );

      return;
    }

    response.locals.validatedParams = result.data;
    next();
  };
}

export { validateParams };