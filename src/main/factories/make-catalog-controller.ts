import { CatalogController } from "../../api/controllers/catalog.controller";
import { CreateProductUseCase } from "../../application/usecases/create-product.use-case";
import { ListMenuUseCase } from "../../application/usecases/list-menu.use-case";
import { SetMenuItemUseCase } from "../../application/usecases/set-menu-item.use-case";
import { PrismaMenuRepository } from "../../infrastructure/database/repositories/prisma-menu-repository";
import { PrismaProductRepository } from "../../infrastructure/database/repositories/prisma-product-repository";
import { PrismaUnitRepository } from "../../infrastructure/database/repositories/prisma-unit-repository";

function makeCatalogController() {
  const unitRepository = new PrismaUnitRepository();
  const productRepository = new PrismaProductRepository();
  const menuRepository = new PrismaMenuRepository();

  const createProductUseCase = new CreateProductUseCase(
    productRepository
  );

  const listMenuUseCase = new ListMenuUseCase(
    unitRepository,
    menuRepository
  );

  const setMenuItemUseCase = new SetMenuItemUseCase(
    unitRepository,
    productRepository,
    menuRepository
  );

  return new CatalogController(
    createProductUseCase,
    listMenuUseCase,
    setMenuItemUseCase
  );
}

export { makeCatalogController };