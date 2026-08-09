import { randomUUID } from "node:crypto";
import { ErrorRequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";

const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  _next
) => {
  const requestId = response.locals.requestId || randomUUID();

  if (error instanceof AppError) {
    response.status(error.status).json({
      timestamp: new Date().toISOString(),
      status: error.status,
      code: error.code,
      message: error.message,
      path: request.originalUrl,
      details: error.details,
      requestId
    });

    return;
  }

  if (error instanceof SyntaxError) {
    response.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      code: "JSON_INVALIDO",
      message: "O corpo JSON enviado está inválido.",
      path: request.originalUrl,
      details: [
        {
          field: "body",
          issue: "Verifique a estrutura do JSON enviado."
        }
      ],
      requestId
    });

    return;
  }

  console.error(error);

  response.status(500).json({
    timestamp: new Date().toISOString(),
    status: 500,
    code: "ERRO_INTERNO",
    message: "Ocorreu um erro interno no servidor.",
    path: request.originalUrl,
    details: [],
    requestId
  });
};

export { errorHandler };