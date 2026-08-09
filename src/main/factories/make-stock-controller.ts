import { StockController } from "../../api/controllers/stock.controller";
import { ApplyStockMovementUseCase } from "../../application/usecases/apply-stock-movement.use-case";
import { ListStockUseCase } from "../../application/usecases/list-stock.use-case";
import { PrismaProductRepository } from "../../infrastructure/database/repositories/prisma-product-repository";
import { PrismaStockRepository } from "../../infrastructure/database/repositories/prisma-stock-repository";
import { PrismaUnitRepository } from "../../infrastructure/database/repositories/prisma-unit-repository";

function makeStockController() {
  const unitRepository = new PrismaUnitRepository();
  const productRepository = new PrismaProductRepository();
  const stockRepository = new PrismaStockRepository();

  const listStockUseCase = new ListStockUseCase(
    unitRepository,
    stockRepository
  );

  const applyStockMovementUseCase =
    new ApplyStockMovementUseCase(
      unitRepository,
      productRepository,
      stockRepository
    );

  return new StockController(
    listStockUseCase,
    applyStockMovementUseCase
  );
}

export { makeStockController };