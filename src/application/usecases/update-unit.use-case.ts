import { UserRole } from "../../domain/enums/user-role";
import { UnitType } from "../../domain/enums/unit-type";
import type {
  UnitRepository,
  UpdateUnitData
} from "../../domain/repositories/unit-repository";
import { AppError } from "../../shared/errors/app-error";

type UpdateUnitActor = {
  perfil: UserRole;
  unidadeId: string | null;
};

class UpdateUnitUseCase {
  constructor(
    private readonly unitRepository: UnitRepository
  ) {}

  async execute(
    id: string,
    data: UpdateUnitData,
    actor: UpdateUnitActor
  ) {
    if (
      actor.perfil === UserRole.GERENTE &&
      actor.unidadeId !== id
    ) {
      throw new AppError(
        403,
        "UNIDADE_SEM_PERMISSAO",
        "O gerente só pode alterar sua própria unidade."
      );
    }

    if (
      actor.perfil === UserRole.GERENTE &&
      (
        data.tipo !== undefined ||
        data.unidadeMatrizId !== undefined ||
        data.ativo !== undefined
      )
    ) {
      throw new AppError(
        403,
        "ALTERACAO_NAO_PERMITIDA",
        "O gerente não pode alterar a hierarquia ou ativação da unidade."
      );
    }

    const currentUnit = await this.unitRepository.findById(id);

    if (!currentUnit) {
      throw new AppError(
        404,
        "UNIDADE_NAO_ENCONTRADA",
        "A unidade informada não foi encontrada."
      );
    }

    const finalType = data.tipo ?? currentUnit.tipo;

    const finalMatrixId =
      data.unidadeMatrizId !== undefined
        ? data.unidadeMatrizId
        : currentUnit.unidadeMatrizId;

    if (
      finalType === UnitType.MATRIZ &&
      finalMatrixId
    ) {
      throw new AppError(
        422,
        "HIERARQUIA_UNIDADE_INVALIDA",
        "Uma unidade matriz não pode possuir outra matriz."
      );
    }

    if (
      finalType === UnitType.FRANQUIA &&
      !finalMatrixId
    ) {
      throw new AppError(
        422,
        "UNIDADE_MATRIZ_OBRIGATORIA",
        "Uma franquia deve estar vinculada a uma unidade matriz."
      );
    }

    if (finalMatrixId === id) {
      throw new AppError(
        409,
        "AUTORRELACIONAMENTO_INVALIDO",
        "Uma unidade não pode ser sua própria matriz."
      );
    }

    if (finalMatrixId) {
      const matriz = await this.unitRepository.findById(
        finalMatrixId
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

    return this.unitRepository.update(id, {
      ...data,
      nome: data.nome?.trim(),
      uf: data.uf?.toUpperCase()
    });
  }
}

export { UpdateUnitUseCase };