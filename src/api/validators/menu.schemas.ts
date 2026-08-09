import { z } from "zod";

const listMenuQuerySchema = z
  .object({
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

const menuUnitParamsSchema = z
  .object({
    unidadeId: z.uuid({
      error: "O ID da unidade deve ser um UUID válido."
    })
  })
  .strict();

const menuItemParamsSchema = z
  .object({
    unidadeId: z.uuid({
      error: "O ID da unidade deve ser um UUID válido."
    }),
    produtoId: z.uuid({
      error: "O ID do produto deve ser um UUID válido."
    })
  })
  .strict();

const setMenuItemSchema = z
  .object({
    preco: z
      .number({ error: "O preço deve ser um número." })
      .positive({ error: "O preço deve ser maior que zero." })
      .max(99999999.99, { error: "O preço informado é muito alto." }),
    disponivel: z.boolean({
      error: "Informe se o produto está disponível."
    })
  })
  .strict();

export {
  listMenuQuerySchema,
  menuItemParamsSchema,
  menuUnitParamsSchema,
  setMenuItemSchema
};