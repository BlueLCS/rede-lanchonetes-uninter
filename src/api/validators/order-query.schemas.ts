import { z } from "zod";

const listOrdersQuerySchema = z
  .object({
    canalPedido: z
      .enum(["APP", "WEB", "TOTEM"], {
        error: "O canal deve ser APP, WEB ou TOTEM."
      })
      .optional(),
    status: z
      .enum(
        [
          "AGUARDANDO_PAGAMENTO",
          "PAGAMENTO_APROVADO",
          "EM_PREPARO",
          "PRONTO",
          "ENTREGUE",
          "CANCELADO"
        ],
        {
          error: "O status informado é inválido."
        }
      )
      .optional(),
    unidadeId: z
      .uuid({
        error: "O ID da unidade deve ser um UUID válido."
      })
      .optional(),
    clienteId: z
      .uuid({
        error: "O ID do cliente deve ser um UUID válido."
      })
      .optional(),
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

const orderPaymentParamsSchema = z
  .object({
    pedidoId: z.uuid({
      error: "O ID do pedido deve ser um UUID válido."
    })
  })
  .strict();

export {
  listOrdersQuerySchema,
  orderPaymentParamsSchema
};