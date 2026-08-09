import { UnitController } from "../../api/controllers/unit.controller";
import { CreateUnitUseCase } from "../../application/usecases/create-unit.use-case";
import { ListUnitsUseCase } from "../../application/usecases/list-units.use-case";
import { UpdateUnitUseCase } from "../../application/usecases/update-unit.use-case";
import { PrismaUnitRepository } from "../../infrastructure/database/repositories/prisma-unit-repository";

function makeUnitController() {
  const unitRepository = new PrismaUnitRepository();

  const listUnitsUseCase = new ListUnitsUseCase(
    unitRepository
  );

  const createUnitUseCase = new CreateUnitUseCase(
    unitRepository
  );

  const updateUnitUseCase = new UpdateUnitUseCase(
    unitRepository
  );

  return new UnitController(
    listUnitsUseCase,
    createUnitUseCase,
    updateUnitUseCase
  );
}

export { makeUnitController };