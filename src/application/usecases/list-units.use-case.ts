import type { UnitRepository } from "../../domain/repositories/unit-repository";

class ListUnitsUseCase {
  constructor(
    private readonly unitRepository: UnitRepository
  ) {}

  async execute(page: number, limit: number) {
    const result = await this.unitRepository.listActive(
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

export { ListUnitsUseCase };