import { UserRole } from "../../domain/enums/user-role";
import { StockMovementType } from "../../domain/enums/stock-movement-type";
import type { ProductRepository } from "../../domain/repositories/product-repository";
import type { StockRepository } from "../../domain/repositories/stock-repository";
import type { UnitRepository } from "../../domain/repositories/unit-repository";
import { AppError } from "../../shared/errors/app-error";

type MovementActor = {
  userId: string;
  perfil: UserRole;
  unidadeId: string | null;
};

type MovementInput = {
  unidadeId: string;
  produtoId: string;
  tipo: StockMovementType.ENTRADA | StockMovementType.SAIDA;
  quantidade: number;
  motivo: string;
};

class ApplyStockMovementUseCase {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly productRepository: ProductRepository,
    private readonly stockRepository: StockRepository
  ) {}

  async execute(
    input: MovementInput,
    actor: MovementActor
  ) {
    if (
      actor.perfil === UserRole.GERENTE &&
      actor.unidadeId !== input.unidadeId
    ) {
      throw new AppError(
        403,
        "UNIDADE_SEM_PERMISSAO",
        "O gerente só pode movimentar o estoque de sua unidade."
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
        "Não é possível movimentar o estoque de uma unidade inativa."
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
        "Não é possível movimentar o estoque de um produto inativo."
      );
    }

    const result = await this.stockRepository.applyMovement({
      ...input,
      usuarioId: actor.userId
    });

    if (!result.success) {
      throw new AppError(
        409,
        "ESTOQUE_INSUFICIENTE",
        "Não existe estoque suficiente para realizar a saída.",
        [
          {
            field: "quantidade",
            issue: "A quantidade solicitada ultrapassa o saldo disponível."
          }
        ]
      );
    }

    return {
      estoque: result.stock,
      movimentacao: result.movement
    };
  }
}

export { ApplyStockMovementUseCase };