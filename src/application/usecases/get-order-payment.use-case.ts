import { UserRole } from "../../domain/enums/user-role";
import type { OrderQueryRepository } from "../../domain/repositories/order-query-repository";
import type { PaymentRepository } from "../../domain/repositories/payment-repository";
import { AppError } from "../../shared/errors/app-error";

type PaymentActor = {
  userId: string;
  perfil: UserRole;
  unidadeId: string | null;
};

class GetOrderPaymentUseCase {
  constructor(
    private readonly orderRepository: OrderQueryRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  async execute(
    pedidoId: string,
    actor: PaymentActor
  ) {
    const pedido = await this.orderRepository.findById(
      pedidoId
    );

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
        "O cliente não pode consultar este pedido."
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
        "O usuário não pode consultar pagamentos desta unidade."
      );
    }

    const pagamento =
      await this.paymentRepository.findByOrderId(pedidoId);

    if (!pagamento) {
      throw new AppError(
        404,
        "PAGAMENTO_NAO_ENCONTRADO",
        "Este pedido ainda não possui um pagamento registrado."
      );
    }

    return pagamento;
  }
}

export { GetOrderPaymentUseCase };