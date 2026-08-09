import { z } from "zod";

export const registerConsentSchema = z.object({
  finalidade: z.enum(["PROGRAMA_FIDELIDADE"]),
  aceito: z.boolean(),
  versaoTermo: z.string().trim().min(1).max(20)
}).strict();