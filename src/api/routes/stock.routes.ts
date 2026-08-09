import { Router } from "express";
import { UserRole } from "../../domain/enums/user-role";
import { makeStockController } from "../../main/factories/make-stock-controller";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { validateBody } from "../middlewares/validate-body";
import { validateQuery } from "../middlewares/validate-query";
import {
  listStockQuerySchema,
  stockMovementSchema
} from "../validators/stock.schemas";

const stockRoutes = Router();
const stockController = makeStockController();

stockRoutes.get(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.GERENTE,
    UserRole.ATENDENTE,
    UserRole.COZINHA
  ),
  validateQuery(listStockQuerySchema),
  stockController.list
);

stockRoutes.post(
  "/movimentacoes",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.GERENTE),
  validateBody(stockMovementSchema),
  stockController.move
);

export { stockRoutes };