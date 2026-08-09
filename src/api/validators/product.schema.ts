import { z } from "zod";

const createProductSchema = z
  .object({
    nome: z
      .string({ error: "O nome é obrigatório." })
      .trim()
      .min(2, { error: "O nome deve possuir pelo menos 2 caracteres." })
      .max(120, { error: "O nome deve possuir no máximo 120 caracteres." }),
    descricao: z
      .string({ error: "A descrição deve ser um texto." })
      .trim()
      .max(500, {
        error: "A descrição deve possuir no máximo 500 caracteres."
      })
      .nullable()
      .optional(),
    categoria: z
      .string({ error: "A categoria é obrigatória." })
      .trim()
      .min(2, { error: "Informe uma categoria válida." })
      .max(60, {
        error: "A categoria deve possuir no máximo 60 caracteres."
      })
      .toUpperCase()
  })
  .strict();

export { createProductSchema };