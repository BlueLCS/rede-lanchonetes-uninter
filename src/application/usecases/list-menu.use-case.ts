import type { MenuRepository } from "../../domain/repositories/menu-repository";
import type { UnitRepository } from "../../domain/repositories/unit-repository";
import { AppError } from "../../shared/errors/app-error";

class ListMenuUseCase {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly menuRepository: MenuRepository
  ) {}

  async execute(
    unidadeId: string,
    page: number,
    limit: number
  ) {
    const unidade = await this.unitRepository.findById(
      unidadeId
    );

    if (!unidade || !unidade.ativo) {
      throw new AppError(
        404,
        "UNIDADE_NAO_ENCONTRADA",
        "A unidade informada não foi encontrada."
      );
    }

    const result =
      await this.menuRepository.listAvailableByUnit(
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

export { ListMenuUseCase };