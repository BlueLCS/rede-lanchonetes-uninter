import { Router } from "express";
import { UserRole } from "../../domain/enums/user-role";
import { makeOrderController } from "../../main/factories/make-order-controller";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { validateBody } from "../middlewares/validate-body";
import { createOrderSchema } from "../validators/order.schema";

const orderRoutes = Router();
const orderController = makeOrderController();

orderRoutes.post(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.ATENDENTE,
    UserRole.CLIENTE
  ),
  validateBody(createOrderSchema),
  orderController.create
);

export { orderRoutes };