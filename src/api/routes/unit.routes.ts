import { Router } from "express";
import { UserRole } from "../../domain/enums/user-role";
import { makeUnitController } from "../../main/factories/make-unit-controller";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { validateBody } from "../middlewares/validate-body";
import { validateParams } from "../middlewares/validate-params";
import { validateQuery } from "../middlewares/validate-query";
import {
  createUnitSchema,
  listUnitsQuerySchema,
  unitIdParamsSchema,
  updateUnitSchema
} from "../validators/unit.schemas";

const unitRoutes = Router();
const unitController = makeUnitController();

unitRoutes.get(
  "/",
  validateQuery(listUnitsQuerySchema),
  unitController.list
);

unitRoutes.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  validateBody(createUnitSchema),
  unitController.create
);

unitRoutes.patch(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.GERENTE),
  validateParams(unitIdParamsSchema),
  validateBody(updateUnitSchema),
  unitController.update
);

export { unitRoutes };