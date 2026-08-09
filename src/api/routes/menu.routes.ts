import { Router } from "express";
import { UserRole } from "../../domain/enums/user-role";
import { makeCatalogController } from "../../main/factories/make-catalog-controller";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { validateBody } from "../middlewares/validate-body";
import { validateParams } from "../middlewares/validate-params";
import { validateQuery } from "../middlewares/validate-query";
import {
  listMenuQuerySchema,
  menuItemParamsSchema,
  menuUnitParamsSchema,
  setMenuItemSchema
} from "../validators/menu.schemas";

const menuRoutes = Router();
const catalogController = makeCatalogController();

menuRoutes.get(
  "/:unidadeId/cardapio",
  validateParams(menuUnitParamsSchema),
  validateQuery(listMenuQuerySchema),
  catalogController.listMenu
);

menuRoutes.put(
  "/:unidadeId/cardapio/:produtoId",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.GERENTE),
  validateParams(menuItemParamsSchema),
  validateBody(setMenuItemSchema),
  catalogController.setMenuItem
);

export { menuRoutes };