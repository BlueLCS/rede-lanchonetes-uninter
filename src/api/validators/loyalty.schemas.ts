import { z } from "zod";

export const redeemLoyaltyPointsSchema = z.object({
  pontos: z.number().int().positive()
}).strict();