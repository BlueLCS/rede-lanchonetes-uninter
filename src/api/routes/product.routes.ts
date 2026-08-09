import { Router } from "express";
import { UserRole } from "../../domain/enums/user-role";
import { makeCatalogController } from "../../main/factories/make-catalog-controller";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { validateBody } from "../middlewares/validate-body";
import { createProductSchema } from "../validators/product.schema";

const productRoutes = Router();
const catalogController = makeCatalogController();

productRoutes.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  validateBody(createProductSchema),
  catalogController.createProduct
);

export { productRoutes };