import type { Request, Response } from "express";
import type { RegisterConsentUseCase } from "../../application/usecases/register-consent.use-case";

export class ConsentController {
  constructor(
    private readonly registerConsentUseCase: RegisterConsentUseCase
  ) {}

  create = async (request: Request, response: Response) => {
    const consent = await this.registerConsentUseCase.execute({
      usuarioId: response.locals.auth.userId,
      finalidade: request.body.finalidade,
      aceito: request.body.aceito,
      versaoTermo: request.body.versaoTermo,
      ip: request.ip ?? null
    });

    return response.status(201).json({
      id: consent.id,
      usuarioId: consent.usuarioId,
      finalidade: consent.finalidade,
      aceito: consent.aceito,
      versaoTermo: consent.versaoTermo,
      registradoEm: consent.registradoEm.toISOString()
    });
  };
}