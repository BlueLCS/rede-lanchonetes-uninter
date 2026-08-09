import { OrderController } from "../../api/controllers/order.controller";
import { CancelOrderUseCase } from "../../application/usecases/cancel-order.use-case";
import { CreateOrderUseCase } from "../../application/usecases/create-order.use-case";
import { GetOrderPaymentUseCase } from "../../application/usecases/get-order-payment.use-case";
import { ListOrdersUseCase } from "../../application/usecases/list-orders.use-case";
import { UpdateOrderStatusUseCase } from "../../application/usecases/update-order-status.use-case";
import { PrismaMenuRepository } from "../../infrastructure/database/repositories/prisma-menu-repository";
import { PrismaOrderQueryRepository } from "../../infrastructure/database/repositories/prisma-order-query-repository";
import { PrismaOrderRepository } from "../../infrastructure/database/repositories/prisma-order-repository";
import { PrismaOrderWorkflowRepository } from "../../infrastructure/database/repositories/prisma-order-workflow-repository";
import { PrismaPaymentRepository } from "../../infrastructure/database/repositories/prisma-payment-repository";
import { PrismaUnitRepository } from "../../infrastructure/database/repositories/prisma-unit-repository";
import { PrismaUserRepository } from "../../infrastructure/database/repositories/prisma-user-repository";
import { MockPaymentGateway } from "../../infrastructure/payment/mock-payment-gateway";
import { CreditDeliveredOrderPointsUseCase } from "../../application/usecases/credit-delivered-order-points.use-case";
import { PrismaConsentRepository } from "../../infrastructure/database/repositories/prisma-consent-repository";
import { PrismaLoyaltyRepository } from "../../infrastructure/database/repositories/prisma-loyalty-repository";


function makeOrderController() {
  const userRepository = new PrismaUserRepository();
  const unitRepository = new PrismaUnitRepository();
  const menuRepository = new PrismaMenuRepository();
  const orderRepository = new PrismaOrderRepository();
  const orderQueryRepository =
    new PrismaOrderQueryRepository();
  const workflowRepository =
    new PrismaOrderWorkflowRepository();
  const paymentRepository = new PrismaPaymentRepository();
  const paymentGateway = new MockPaymentGateway();
  const loyaltyRepository =
  new PrismaLoyaltyRepository();
const consentRepository =
  new PrismaConsentRepository();

const creditDeliveredOrderPointsUseCase =
  new CreditDeliveredOrderPointsUseCase(
    loyaltyRepository,
    consentRepository
  );

  const createOrderUseCase = new CreateOrderUseCase(
    userRepository,
    unitRepository,
    menuRepository,
    orderRepository,
    paymentGateway,
    paymentRepository
  );

  const listOrdersUseCase = new ListOrdersUseCase(
    orderQueryRepository
  );

  const getOrderPaymentUseCase =
    new GetOrderPaymentUseCase(
      orderQueryRepository,
      paymentRepository
    );

  const updateOrderStatusUseCase =
  new UpdateOrderStatusUseCase(
    orderQueryRepository,
    workflowRepository,
    creditDeliveredOrderPointsUseCase
  );
  const cancelOrderUseCase = new CancelOrderUseCase(
    orderQueryRepository,
    workflowRepository
  );

  return new OrderController(
    createOrderUseCase,
    listOrdersUseCase,
    getOrderPaymentUseCase,
    updateOrderStatusUseCase,
    cancelOrderUseCase
  );
}

export { makeOrderController };