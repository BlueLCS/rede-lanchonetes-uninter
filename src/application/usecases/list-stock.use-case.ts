import { UserRole } from "../../domain/enums/user-role";
import type { StockRepository } from "../../domain/repositories/stock-repository";
import type { UnitRepository } from "../../domain/repositories/unit-repository";
import { AppError } from "../../shared/errors/app-error";

type StockActor = {
  perfil: UserRole;
  unidadeId: string | null;
};

class ListStockUseCase {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly stockRepository: StockRepository
  ) {}

  async execute(
    unidadeId: string,
    page: number,
    limit: number,
    actor: StockActor
  ) {
    if (
      actor.perfil !== UserRole.ADMIN &&
      actor.unidadeId !== unidadeId
    ) {
      throw new AppError(
        403,
        "UNIDADE_SEM_PERMISSAO",
        "Seu perfil não pode consultar o estoque desta unidade."
      );
    }

    const unidade = await this.unitRepository.findById(
      unidadeId
    );

    if (!unidade) {
      throw new AppError(
        404,
        "UNIDADE_NAO_ENCONTRADA",
        "A unidade informada não foi encontrada."
      );
    }

    const result = await this.stockRepository.listByUnit(
      unidadeId,
      page,
      limit
    );

    return {
      items: result.items,
      page,
      limit,
      total: result.total
    };
  }
}

export { ListStockUseCase };