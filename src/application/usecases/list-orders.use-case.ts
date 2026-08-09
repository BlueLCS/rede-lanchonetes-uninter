import { OrderChannel } from "../../domain/enums/order-channel";
import { OrderStatus } from "../../domain/enums/order-status";
import { UserRole } from "../../domain/enums/user-role";
import type { OrderQueryRepository } from "../../domain/repositories/order-query-repository";
import { AppError } from "../../shared/errors/app-error";

type ListOrdersInput = {
  canalPedido?: OrderChannel;
  status?: OrderStatus;
  unidadeId?: string;
  clienteId?: string;
  page: number;
  limit: number;
};

type ListOrdersActor = {
  userId: string;
  perfil: UserRole;
  unidadeId: string | null;
};

class ListOrdersUseCase {
  constructor(
    private readonly orderRepository: OrderQueryRepository
  ) {}

  async execute(
    input: ListOrdersInput,
    actor: ListOrdersActor
  ) {
    let clienteId = input.clienteId;
    let unidadeId = input.unidadeId;

    if (actor.perfil === UserRole.CLIENTE) {
      clienteId = actor.userId;
      unidadeId = undefined;
    } else if (actor.perfil !== UserRole.ADMIN) {
      if (!actor.unidadeId) {
        throw new AppError(
          403,
          "UNIDADE_NAO_VINCULADA",
          "O usuário não possui uma unidade vinculada."
        );
      }

      unidadeId = actor.unidadeId;
    }

    const result = await this.orderRepository.list({
      canalPedido: input.canalPedido,
      status: input.status,
      unidadeId,
      clienteId,
      page: input.page,
      limit: input.limit
    });

    return {
      items: result.items,
      page: input.page,
      limit: input.limit,
      total: result.total
    };
  }
}

export { ListOrdersUseCase };