import { z } from "zod";

const registerUserSchema = z
  .object({
    nome: z
      .string({ error: "O nome é obrigatório." })
      .trim()
      .min(3, { error: "O nome deve possuir pelo menos 3 caracteres." })
      .max(120, { error: "O nome deve possuir no máximo 120 caracteres." }),
    email: z
      .string({ error: "O e-mail é obrigatório." })
      .trim()
      .email({ error: "Informe um endereço de e-mail válido." })
      .max(150, { error: "O e-mail deve possuir no máximo 150 caracteres." })
      .toLowerCase(),
    senha: z
      .string({ error: "A senha é obrigatória." })
      .min(8, { error: "A senha deve possuir pelo menos 8 caracteres." })
      .max(72, { error: "A senha deve possuir no máximo 72 caracteres." })
      .regex(/[A-Z]/, {
        error: "A senha deve possuir pelo menos uma letra maiúscula."
      })
      .regex(/[a-z]/, {
        error: "A senha deve possuir pelo menos uma letra minúscula."
      })
      .regex(/[0-9]/, {
        error: "A senha deve possuir pelo menos um número."
      })
  })
  .strict();

export { registerUserSchema };