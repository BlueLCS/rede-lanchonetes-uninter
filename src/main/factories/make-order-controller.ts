import { OrderController } from "../../api/controllers/order.controller";
import { CreateOrderUseCase } from "../../application/usecases/create-order.use-case";
import { PrismaMenuRepository } from "../../infrastructure/database/repositories/prisma-menu-repository";
import { PrismaOrderRepository } from "../../infrastructure/database/repositories/prisma-order-repository";
import { PrismaPaymentRepository } from "../../infrastructure/database/repositories/prisma-payment-repository";
import { PrismaUnitRepository } from "../../infrastructure/database/repositories/prisma-unit-repository";
import { PrismaUserRepository } from "../../infrastructure/database/repositories/prisma-user-repository";
import { MockPaymentGateway } from "../../infrastructure/payment/mock-payment-gateway";

function makeOrderController() {
  const userRepository = new PrismaUserRepository();
  const unitRepository = new PrismaUnitRepository();
  const menuRepository = new PrismaMenuRepository();
  const orderRepository = new PrismaOrderRepository();
  const paymentRepository = new PrismaPaymentRepository();
  const paymentGateway = new MockPaymentGateway();

  const createOrderUseCase = new CreateOrderUseCase(
    userRepository,
    unitRepository,
    menuRepository,
    orderRepository,
    paymentGateway,
    paymentRepository
  );

  return new OrderController(createOrderUseCase);
}

export { makeOrderController };