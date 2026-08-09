import { Router } from "express";
import { UserRole } from "../../domain/enums/user-role";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { validateBody } from "../middlewares/validate-body";
import { makeConsentController } from "../../main/factories/make-consent-controller";
import { registerConsentSchema } from "../validators/consent.schemas";

export const consentRoutes = Router();

const consentController = makeConsentController();

consentRoutes.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.CLIENTE),
  validateBody(registerConsentSchema),
  consentController.create
);