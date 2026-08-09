import { z } from "zod";

const loginSchema = z
  .object({
    email: z
      .string({ error: "O e-mail é obrigatório." })
      .trim()
      .email({ error: "Informe um endereço de e-mail válido." })
      .toLowerCase(),
    senha: z
      .string({ error: "A senha é obrigatória." })
      .min(1, { error: "A senha é obrigatória." })
  })
  .strict();

export { loginSchema };