import { z } from "zod";

const createOrderSchema = z
  .object({
    canalPedido: z.enum(["APP", "WEB", "TOTEM"], {
      error: "O canal deve ser APP, WEB ou TOTEM."
    }),
    clienteId: z.uuid({
      error: "O ID do cliente deve ser um UUID válido."
    }),
    unidadeId: z.uuid({
      error: "O ID da unidade deve ser um UUID válido."
    }),
    itens: z
      .array(
        z
          .object({
            produtoId: z.uuid({
              error: "O ID do produto deve ser um UUID válido."
            }),
            quantidade: z
              .number({
                error: "A quantidade deve ser um número."
              })
              .int({
                error: "A quantidade deve ser um número inteiro."
              })
              .positive({
                error: "A quantidade deve ser maior que zero."
              })
              .max(100, {
                error: "A quantidade máxima por item é 100."
              })
          })
          .strict()
      )
      .min(1, {
        error: "O pedido deve possuir pelo menos um item."
      })
      .max(20, {
        error: "O pedido deve possuir no máximo 20 itens."
      }),
    formaPagamento: z.literal("MOCK", {
      error: "A forma de pagamento deve ser MOCK."
    })
  })
  .strict()
  .superRefine((data, context) => {
    const ids = data.itens.map((item) => item.produtoId);

    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["itens"],
        message: "Não repita o mesmo produto no pedido."
      });
    }
  });

export { createOrderSchema };