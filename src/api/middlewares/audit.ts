import type {
  NextFunction,
  Request,
  Response
} from "express";
import { PrismaAuditRepository } from "../../infrastructure/database/repositories/prisma-audit-repository";

const auditRepository = new PrismaAuditRepository();

const auditedMethods = new Set([
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function audit(
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (!auditedMethods.has(request.method)) {
    next();
    return;
  }

  response.on("finish", () => {
    const route = request.originalUrl.split("?")[0];
    const segments = route.split("/").filter(Boolean);
    const entity = segments[0] || "sistema";

    const entityId =
      segments.find((segment) => uuidPattern.test(segment)) ||
      null;

    const headerRequestId =
      response.getHeader("x-request-id");

    const savedRequestId =
      response.locals.requestId || headerRequestId;

    const requestId =
      typeof savedRequestId === "string"
        ? savedRequestId
        : null;

    const usuarioId =
      response.locals.auth?.userId || null;

    void auditRepository
      .create({
        usuarioId,
        requestId,
        acao: `${request.method} ${route}`,
        entidade: entity,
        entidadeId: entityId,
        dados: {
          statusHttp: response.statusCode,
          rota: route,
          resultado:
            response.statusCode < 400
              ? "SUCESSO"
              : "ERRO"
        },
        ip: request.ip ?? null
      })
      .catch((error) => {
        console.error(
          "Não foi possível registrar a auditoria.",
          error
        );
      });
  });

  next();
}

export { audit };