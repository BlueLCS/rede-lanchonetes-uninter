import { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";

function notFound(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  next(
    new AppError(
      404,
      "ROTA_NAO_ENCONTRADA",
      `A rota ${request.method} ${request.originalUrl} não foi encontrada.`
    )
  );
}

export { notFound };