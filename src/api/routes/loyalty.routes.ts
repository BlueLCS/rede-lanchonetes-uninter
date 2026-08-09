import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { validateBody } from "../middlewares/validate-body";
import { Router } from "express";
import { UserRole } from "../../domain/enums/user-role";
import { makeLoyaltyController } from "../../main/factories/make-loyalty-controller";
import { redeemLoyaltyPointsSchema } from "../validators/loyalty.schemas";

export const loyaltyRoutes = Router();

const loyaltyController = makeLoyaltyController();

loyaltyRoutes.get(
  "/saldo",
  authenticate,
  authorizeRoles(UserRole.CLIENTE),
  loyaltyController.balance
);

loyaltyRoutes.post(
  "/resgates",
  authenticate,
  authorizeRoles(UserRole.CLIENTE),
  validateBody(redeemLoyaltyPointsSchema),
  loyaltyController.redeem
);