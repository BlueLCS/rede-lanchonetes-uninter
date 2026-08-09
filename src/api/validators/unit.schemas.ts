import { z } from "zod";

const unitFields = {
  unidadeMatrizId: z
    .uuid({ error: "Informe um UUID válido para a unidade matriz." })
    .nullable()
    .optional(),
  nome: z
    .string({ error: "O nome é obrigatório." })
    .trim()
    .min(3, { error: "O nome deve possuir pelo menos 3 caracteres." })
    .max(120, { error: "O nome deve possuir no máximo 120 caracteres." }),
  tipo: z.enum(["MATRIZ", "FRANQUIA"], {
    error: "O tipo deve ser MATRIZ ou FRANQUIA."
  }),
  logradouro: z
    .string({ error: "O logradouro é obrigatório." })
    .trim()
    .min(3, { error: "Informe um logradouro válido." })
    .max(150, { error: "O logradouro deve possuir no máximo 150 caracteres." }),
  numero: z
    .string({ error: "O número é obrigatório." })
    .trim()
    .min(1, { error: "O número é obrigatório." })
    .max(20, { error: "O número deve possuir no máximo 20 caracteres." }),
  bairro: z
    .string({ error: "O bairro é obrigatório." })
    .trim()
    .min(2, { error: "Informe um bairro válido." })
    .max(100, { error: "O bairro deve possuir no máximo 100 caracteres." }),
  cidade: z
    .string({ error: "A cidade é obrigatória." })
    .trim()
    .min(2, { error: "Informe uma cidade válida." })
    .max(100, { error: "A cidade deve possuir no máximo 100 caracteres." }),
  uf: z
    .string({ error: "A UF é obrigatória." })
    .trim()
    .length(2, { error: "A UF deve possuir duas letras." })
    .toUpperCase(),
  cep: z
    .string({ error: "O CEP é obrigatório." })
    .trim()
    .regex(/^\d{5}-?\d{3}$/, {
      error: "Informe o CEP no formato 00000-000."
    })
};

const createUnitSchema = z.object(unitFields).strict();

const updateUnitSchema = z
  .object({
    unidadeMatrizId: unitFields.unidadeMatrizId,
    nome: unitFields.nome.optional(),
    tipo: unitFields.tipo.optional(),
    logradouro: unitFields.logradouro.optional(),
    numero: unitFields.numero.optional(),
    bairro: unitFields.bairro.optional(),
    cidade: unitFields.cidade.optional(),
    uf: unitFields.uf.optional(),
    cep: unitFields.cep.optional(),
    ativo: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    error: "Informe pelo menos um campo para atualização."
  });

const listUnitsQuerySchema = z
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

const unitIdParamsSchema = z
  .object({
    id: z.uuid({ error: "O ID da unidade deve ser um UUID válido." })
  })
  .strict();

export {
  createUnitSchema,
  listUnitsQuerySchema,
  unitIdParamsSchema,
  updateUnitSchema
};