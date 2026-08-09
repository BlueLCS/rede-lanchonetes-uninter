import { z } from "zod";

const orderIdParamsSchema = z
  .object({
    id: z.uuid({
      error: "O ID do pedido deve ser um UUID válido."
    })
  })
  .strict();

const updateOrderStatusSchema = z
  .object({
    status: z.enum(
      ["EM_PREPARO", "PRONTO", "ENTREGUE"],
      {
        error:
          "O status deve ser EM_PREPARO, PRONTO ou ENTREGUE."
      }
    ),
    motivo: z
      .string({ error: "O motivo deve ser um texto." })
      .trim()
      .min(3, {
        error: "O motivo deve possuir pelo menos 3 caracteres."
      })
      .max(200, {
        error: "O motivo deve possuir no máximo 200 caracteres."
      })
      .optional()
  })
  .strict();

const cancelOrderSchema = z
  .object({
    motivo: z
      .string({ error: "O motivo é obrigatório." })
      .trim()
      .min(3, {
        error: "O motivo deve possuir pelo menos 3 caracteres."
      })
      .max(200, {
        error: "O motivo deve possuir no máximo 200 caracteres."
      })
  })
  .strict();

export {
  cancelOrderSchema,
  orderIdParamsSchema,
  updateOrderStatusSchema
};