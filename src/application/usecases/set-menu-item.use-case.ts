import { UserRole } from "../../domain/enums/user-role";
import type { MenuRepository } from "../../domain/repositories/menu-repository";
import type { ProductRepository } from "../../domain/repositories/product-repository";
import type { UnitRepository } from "../../domain/repositories/unit-repository";
import { AppError } from "../../shared/errors/app-error";

type SetMenuActor = {
  perfil: UserRole;
  unidadeId: string | null;
};

type SetMenuInput = {
  unidadeId: string;
  produtoId: string;
  preco: number;
  disponivel: boolean;
};

class SetMenuItemUseCase {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly productRepository: ProductRepository,
    private readonly menuRepository: MenuRepository
  ) {}

  async execute(
    input: SetMenuInput,
    actor: SetMenuActor
  ) {
    if (
      actor.perfil === UserRole.GERENTE &&
      actor.unidadeId !== input.unidadeId
    ) {
      throw new AppError(
        403,
        "UNIDADE_SEM_PERMISSAO",
        "O gerente só pode alterar o cardápio de sua unidade."
      );
    }

    const unidade = await this.unitRepository.findById(
      input.unidadeId
    );

    if (!unidade) {
      throw new AppError(
        404,
        "UNIDADE_NAO_ENCONTRADA",
        "A unidade informada não foi encontrada."
      );
    }

    if (!unidade.ativo) {
      throw new AppError(
        409,
        "UNIDADE_INATIVA",
        "Não é possível alterar o cardápio de uma unidade inativa."
      );
    }

    const produto = await this.productRepository.findById(
      input.produtoId
    );

    if (!produto) {
      throw new AppError(
        404,
        "PRODUTO_NAO_ENCONTRADO",
        "O produto informado não foi encontrado."
      );
    }

    if (!produto.ativo) {
      throw new AppError(
        409,
        "PRODUTO_INATIVO",
        "Não é possível adicionar um produto inativo ao cardápio."
      );
    }

    return this.menuRepository.upsert(input);
  }
}

export { SetMenuItemUseCase };