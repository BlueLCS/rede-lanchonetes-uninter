import { OrderStatus } from "../../domain/enums/order-status";
import { UserRole } from "../../domain/enums/user-role";
import type { OrderQueryRepository } from "../../domain/repositories/order-query-repository";
import type { OrderWorkflowRepository } from "../../domain/repositories/order-workflow-repository";
import { AppError } from "../../shared/errors/app-error";

type CancelOrderActor = {
  userId: string;
  perfil: UserRole;
  unidadeId: string | null;
};

class CancelOrderUseCase {
  constructor(
    private readonly orderQueryRepository: OrderQueryRepository,
    private readonly workflowRepository: OrderWorkflowRepository
  ) {}

  async execute(
    pedidoId: string,
    motivo: string,
    actor: CancelOrderActor
  ) {
    const pedido =
      await this.orderQueryRepository.findById(pedidoId);

    if (!pedido) {
      throw new AppError(
        404,
        "PEDIDO_NAO_ENCONTRADO",
        "O pedido informado não foi encontrado."
      );
    }

    if (
      actor.perfil === UserRole.CLIENTE &&
      pedido.clienteId !== actor.userId
    ) {
      throw new AppError(
        403,
        "PEDIDO_SEM_PERMISSAO",
        "O cliente não pode cancelar este pedido."
      );
    }

    if (
      actor.perfil !== UserRole.ADMIN &&
      actor.perfil !== UserRole.CLIENTE &&
      pedido.unidadeId !== actor.unidadeId
    ) {
      throw new AppError(
        403,
        "UNIDADE_SEM_PERMISSAO",
        "O usuário não pode cancelar pedidos desta unidade."
      );
    }

    const allowedStatuses = [
      OrderStatus.AGUARDANDO_PAGAMENTO,
      OrderStatus.PAGAMENTO_APROVADO
    ];

    if (!allowedStatuses.includes(pedido.status)) {
      throw new AppError(
        409,
        "CANCELAMENTO_NAO_PERMITIDO",
        `Não é possível cancelar um pedido com status ${pedido.status}.`
      );
    }

    return this.workflowRepository.cancel({
      pedidoId,
      usuarioId: actor.userId,
      statusAnterior: pedido.status,
      motivo: motivo.trim()
    });
  }
}

export { CancelOrderUseCase };