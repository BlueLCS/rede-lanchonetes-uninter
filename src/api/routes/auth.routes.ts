import { Router } from "express";
import { makeAuthController } from "../../main/factories/make-auth-controller";
import { validateBody } from "../middlewares/validate-body";
import { loginSchema } from "../validators/login.schema";
import { registerUserSchema } from "../validators/register-user.schema";

const authRoutes = Router();
const authController = makeAuthController();

authRoutes.post(
  "/cadastro",
  validateBody(registerUserSchema),
  authController.register
);

authRoutes.post(
  "/login",
  validateBody(loginSchema),
  authController.login
);

export { authRoutes };