import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../../shared/errors/app-error";

function validateQuery(schema: ZodType) {
  return (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(request.query);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.map(String).join(".") || "query",
        issue: issue.message
      }));

      next(
        new AppError(
          422,
          "PARAMETROS_INVALIDOS",
          "Os parâmetros de consulta são inválidos.",
          details
        )
      );

      return;
    }

    response.locals.validatedQuery = result.data;
    next();
  };
}

export { validateQuery };