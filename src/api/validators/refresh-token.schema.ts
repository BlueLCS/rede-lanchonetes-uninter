import { z } from "zod";

const refreshTokenSchema = z
  .object({
    refreshToken: z
      .string({ error: "O refresh token é obrigatório." })
      .min(64, { error: "O refresh token informado está inválido." })
  })
  .strict();

export { refreshTokenSchema };