import { Router } from "express";
import { UserRole } from "../../domain/enums/user-role";
import { makeOrderController } from "../../main/factories/make-order-controller";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { validateBody } from "../middlewares/validate-body";
import { validateParams } from "../middlewares/validate-params";
import { validateQuery } from "../middlewares/validate-query";
import {
  listOrdersQuerySchema,
  orderPaymentParamsSchema
} from "../validators/order-query.schemas";
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

orderRoutes.get(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.GERENTE,
    UserRole.ATENDENTE,
    UserRole.COZINHA,
    UserRole.CLIENTE
  ),
  validateQuery(listOrdersQuerySchema),
  orderController.list
);

orderRoutes.get(
  "/:pedidoId/pagamento",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.GERENTE,
    UserRole.ATENDENTE,
    UserRole.CLIENTE
  ),
  validateParams(orderPaymentParamsSchema),
  orderController.getPayment
);

export { orderRoutes };