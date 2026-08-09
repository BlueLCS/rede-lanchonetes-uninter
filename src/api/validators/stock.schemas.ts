import { z } from "zod";

const listStockQuerySchema = z
  .object({
    unidadeId: z.uuid({
      error: "O ID da unidade deve ser um UUID válido."
    }),
    page: z.coerce
      .number({ error: "A página deve ser um número." })
      .int({ error: "A página deve ser um número inteiro." })
      .min(1, { error: "A página mínima é 1." })
      .default(1),
    limit: z.coerce
      .number({ error: "O limite deve ser um número." })
      .int({ error: "O limite deve ser um número inteiro." })
      .min(1, { error: "O limite mínimo é 1." })
      .max(100, { error: "O limite máximo é 100." })
      .default(10)
  })
  .strict();

const stockMovementSchema = z
  .object({
    unidadeId: z.uuid({
      error: "O ID da unidade deve ser um UUID válido."
    }),
    produtoId: z.uuid({
      error: "O ID do produto deve ser um UUID válido."
    }),
    tipo: z.enum(["ENTRADA", "SAIDA"], {
      error: "O tipo deve ser ENTRADA ou SAIDA."
    }),
    quantidade: z
      .number({ error: "A quantidade deve ser um número." })
      .int({ error: "A quantidade deve ser um número inteiro." })
      .positive({ error: "A quantidade deve ser maior que zero." }),
    motivo: z
      .string({ error: "O motivo é obrigatório." })
      .trim()
      .min(3, { error: "O motivo deve possuir pelo menos 3 caracteres." })
      .max(255, {
        error: "O motivo deve possuir no máximo 255 caracteres."
      })
  })
  .strict();

export {
  listStockQuerySchema,
  stockMovementSchema
};