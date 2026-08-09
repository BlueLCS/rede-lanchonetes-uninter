import { UnitType } from "../../domain/enums/unit-type";
import type {
  CreateUnitData,
  UnitRepository
} from "../../domain/repositories/unit-repository";
import { AppError } from "../../shared/errors/app-error";

class CreateUnitUseCase {
  constructor(
    private readonly unitRepository: UnitRepository
  ) {}

  async execute(data: CreateUnitData) {
    if (
      data.tipo === UnitType.MATRIZ &&
      data.unidadeMatrizId
    ) {
      throw new AppError(
        422,
        "HIERARQUIA_UNIDADE_INVALIDA",
        "Uma unidade matriz não pode possuir outra matriz."
      );
    }

    if (
      data.tipo === UnitType.FRANQUIA &&
      !data.unidadeMatrizId
    ) {
      throw new AppError(
        422,
        "UNIDADE_MATRIZ_OBRIGATORIA",
        "Uma franquia deve estar vinculada a uma unidade matriz.",
        [
          {
            field: "unidadeMatrizId",
            issue: "Informe o ID da unidade matriz."
          }
        ]
      );
    }

    if (data.unidadeMatrizId) {
      const matriz = await this.unitRepository.findById(
        data.unidadeMatrizId
      );

      if (!matriz) {
        throw new AppError(
          404,
          "UNIDADE_MATRIZ_NAO_ENCONTRADA",
          "A unidade matriz informada não foi encontrada."
        );
      }

      if (
        matriz.tipo !== UnitType.MATRIZ ||
        !matriz.ativo
      ) {
        throw new AppError(
          409,
          "UNIDADE_MATRIZ_INVALIDA",
          "A unidade indicada não é uma matriz ativa."
        );
      }
    }

    return this.unitRepository.create({
      ...data,
      nome: data.nome.trim(),
      uf: data.uf.toUpperCase()
    });
  }
}

export { CreateUnitUseCase };