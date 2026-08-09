import { OrderStatus } from "../../domain/enums/order-status";
import { UserRole } from "../../domain/enums/user-role";
import type { OrderQueryRepository } from "../../domain/repositories/order-query-repository";
import type { OrderWorkflowRepository } from "../../domain/repositories/order-workflow-repository";
import { AppError } from "../../shared/errors/app-error";
import type { CreditDeliveredOrderPointsUseCase } from "./credit-delivered-order-points.use-case";

type UpdateStatusActor = {
  userId: string;
  perfil: UserRole;
  unidadeId: string | null;
};

type UpdateStatusInput = {
  status: OrderStatus;
  motivo?: string;
};

const transitions: Partial<
  Record<OrderStatus, OrderStatus[]>
> = {
  [OrderStatus.PAGAMENTO_APROVADO]: [
    OrderStatus.EM_PREPARO
  ],
  [OrderStatus.EM_PREPARO]: [
    OrderStatus.PRONTO
  ],
  [OrderStatus.PRONTO]: [
    OrderStatus.ENTREGUE
  ]
};

class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderQueryRepository: OrderQueryRepository,
  private readonly workflowRepository: OrderWorkflowRepository,
  private readonly creditDeliveredOrderPointsUseCase: CreditDeliveredOrderPointsUseCase
  ) {}

  async execute(
    pedidoId: string,
    input: UpdateStatusInput,
    actor: UpdateStatusActor
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
      actor.perfil !== UserRole.ADMIN &&
      actor.unidadeId !== pedido.unidadeId
    ) {
      throw new AppError(
        403,
        "UNIDADE_SEM_PERMISSAO",
        "O usuário não pode alterar pedidos desta unidade."
      );
    }

    const allowedTargets = transitions[pedido.status] || [];

    if (!allowedTargets.includes(input.status)) {
      throw new AppError(
        409,
        "TRANSICAO_STATUS_INVALIDA",
        `Não é possível alterar o pedido de ${pedido.status} para ${input.status}.`
      );
    }

    const kitchenStatuses = [
      OrderStatus.EM_PREPARO,
      OrderStatus.PRONTO
    ];

    if (
      kitchenStatuses.includes(input.status) &&
      ![
        UserRole.ADMIN,
        UserRole.GERENTE,
        UserRole.COZINHA
      ].includes(actor.perfil)
    ) {
      throw new AppError(
        403,
        "PERFIL_SEM_PERMISSAO",
        "Este perfil não pode atualizar o fluxo da cozinha."
      );
    }

    if (
      input.status === OrderStatus.ENTREGUE &&
      ![
        UserRole.ADMIN,
        UserRole.GERENTE,
        UserRole.ATENDENTE
      ].includes(actor.perfil)
    ) {
      throw new AppError(
        403,
        "PERFIL_SEM_PERMISSAO",
        "Este perfil não pode marcar o pedido como entregue."
      );
    }

    const updatedOrder =
  await this.workflowRepository.updateStatus({
    pedidoId,
    usuarioId: actor.userId,
    statusAnterior: pedido.status,
    statusNovo: input.status,
    motivo:
      input.motivo?.trim() ||
      "Atualização operacional do pedido"
  });

if (input.status === OrderStatus.ENTREGUE) {
  await this.creditDeliveredOrderPointsUseCase.execute(
    pedidoId
  );
}

return updatedOrder;
  }
}

export { UpdateOrderStatusUseCase };