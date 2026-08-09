import { OrderController } from "../../api/controllers/order.controller";
import { CreateOrderUseCase } from "../../application/usecases/create-order.use-case";
import { PrismaMenuRepository } from "../../infrastructure/database/repositories/prisma-menu-repository";
import { PrismaOrderRepository } from "../../infrastructure/database/repositories/prisma-order-repository";
import { PrismaUnitRepository } from "../../infrastructure/database/repositories/prisma-unit-repository";
import { PrismaUserRepository } from "../../infrastructure/database/repositories/prisma-user-repository";

function makeOrderController() {
  const userRepository = new PrismaUserRepository();
  const unitRepository = new PrismaUnitRepository();
  const menuRepository = new PrismaMenuRepository();
  const orderRepository = new PrismaOrderRepository();

  const createOrderUseCase = new CreateOrderUseCase(
    userRepository,
    unitRepository,
    menuRepository,
    orderRepository
  );

  return new OrderController(createOrderUseCase);
}

export { makeOrderController };