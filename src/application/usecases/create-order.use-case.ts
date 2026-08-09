import { StockReservationError } from "../../domain/errors/stock-reservation-error";
import { OrderChannel } from "../../domain/enums/order-channel";
import { UserRole } from "../../domain/enums/user-role";
import type { MenuRepository } from "../../domain/repositories/menu-repository";
import type { OrderRepository } from "../../domain/repositories/order-repository";
import type { UnitRepository } from "../../domain/repositories/unit-repository";
import type { UserRepository } from "../../domain/repositories/user-repository";
import { AppError } from "../../shared/errors/app-error";

type CreateOrderItemInput = {
  produtoId: string;
  quantidade: number;
};

type CreateOrderInput = {
  canalPedido: OrderChannel;
  clienteId: string;
  unidadeId: string;
  itens: CreateOrderItemInput[];
  formaPagamento: "MOCK";
};

type OrderActor = {
  userId: string;
  perfil: UserRole;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

class CreateOrderUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly unitRepository: UnitRepository,
    private readonly menuRepository: MenuRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(
    input: CreateOrderInput,
    actor: OrderActor
  ) {
    if (
      actor.perfil === UserRole.CLIENTE &&
      actor.userId !== input.clienteId
    ) {
      throw new AppError(
        403,
        "CLIENTE_SEM_PERMISSAO",
        "O cliente só pode criar pedidos para sua própria conta."
      );
    }

    const cliente = await this.userRepository.findById(
      input.clienteId
    );

    if (
      !cliente ||
      !cliente.ativo ||
      cliente.perfil !== UserRole.CLIENTE
    ) {
      throw new AppError(
        404,
        "CLIENTE_NAO_ENCONTRADO",
        "O cliente informado não foi encontrado."
      );
    }

    const unidade = await this.unitRepository.findById(
      input.unidadeId
    );

    if (!unidade || !unidade.ativo) {
      throw new AppError(
        404,
        "UNIDADE_NAO_ENCONTRADA",
        "A unidade informada não foi encontrada."
      );
    }

    const productIds = input.itens.map(
      (item) => item.produtoId
    );

    if (new Set(productIds).size !== productIds.length) {
      throw new AppError(
        422,
        "ITENS_DUPLICADOS",
        "O mesmo produto não pode aparecer mais de uma vez no pedido."
      );
    }

    const itensComPreco = [];

    for (const item of input.itens) {
      const menuItem =
        await this.menuRepository.findByUnitAndProduct(
          input.unidadeId,
          item.produtoId
        );

      if (!menuItem || !menuItem.disponivel) {
        throw new AppError(
          409,
          "PRODUTO_INDISPONIVEL",
          "Um dos produtos não está disponível no cardápio da unidade.",
          [
            {
              field: "produtoId",
              issue: item.produtoId
            }
          ]
        );
      }

      const subtotal = roundMoney(
        menuItem.preco * item.quantidade
      );

      itensComPreco.push({
        produtoId: item.produtoId,
        produtoNome: menuItem.nome,
        quantidade: item.quantidade,
        precoUnitario: menuItem.preco,
        subtotal
      });
    }

    const subtotal = roundMoney(
      itensComPreco.reduce(
        (total, item) => total + item.subtotal,
        0
      )
    );

    const desconto = 0;
    const valorTotal = roundMoney(subtotal - desconto);

    try {
      return await this.orderRepository.createWithStockReservation({
        clienteId: input.clienteId,
        unidadeId: input.unidadeId,
        canalPedido: input.canalPedido,
        formaPagamento: input.formaPagamento,
        subtotal,
        desconto,
        valorTotal,
        usuarioOperacaoId: actor.userId,
        itens: itensComPreco
      });
    } catch (error) {
      if (error instanceof StockReservationError) {
        throw new AppError(
          409,
          "ESTOQUE_INSUFICIENTE",
          "Não existe estoque suficiente para um dos produtos.",
          [
            {
              field: "produtoId",
              issue: error.produtoId
            }
          ]
        );
      }

      throw error;
    }
  }
}

export { CreateOrderUseCase };