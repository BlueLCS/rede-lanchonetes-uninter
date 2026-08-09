import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../../shared/errors/app-error";

function validateBody(schema: ZodType) {
  return (
    request: Request,
    _response: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.map(String).join(".") || "body",
        issue: issue.message
      }));

      next(
        new AppError(
          422,
          "DADOS_INVALIDOS",
          "Os dados enviados são inválidos.",
          details
        )
      );

      return;
    }

    request.body = result.data;
    next();
  };
}

export { validateBody };