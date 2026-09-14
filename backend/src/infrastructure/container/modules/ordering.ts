import { container } from 'tsyringe';
import { OrderingTokens } from '../../../modules/ordering/infrastructure/tokens/ordering.tokens.js';
import { OrderRepositoryImpl } from '../../../modules/ordering/infrastructure/persistence/prisma/order.repository.js';
import { PlaceOrderUseCaseImpl } from '../../../modules/ordering/application/use-cases/place-order.use-case.impl.js';
import { GetCustomerOrdersUseCaseImpl } from '../../../modules/ordering/application/use-cases/get-customer-orders.use-case.impl.js';
import { GetRestaurantOrdersUseCaseImpl } from '../../../modules/ordering/application/use-cases/get-restaurant-orders.use-case.impl.js';
import { UpdateOrderStatusUseCaseImpl } from '../../../modules/ordering/application/use-cases/update-order-status.use-case.impl.js';
import { GetOrderByIdUseCaseImpl } from '../../../modules/ordering/application/use-cases/get-order-by-id.use-case.impl.js';

export function registerOrdering(): void {
  // Repositories
  container.registerSingleton(OrderingTokens.OrderRepository, OrderRepositoryImpl);

  // Use Cases
  container.registerSingleton(OrderingTokens.PlaceOrderUseCase, PlaceOrderUseCaseImpl);
  container.registerSingleton(
    OrderingTokens.GetCustomerOrdersUseCase,
    GetCustomerOrdersUseCaseImpl,
  );
  container.registerSingleton(
    OrderingTokens.GetRestaurantOrdersUseCase,
    GetRestaurantOrdersUseCaseImpl,
  );
  container.registerSingleton(
    OrderingTokens.UpdateOrderStatusUseCase,
    UpdateOrderStatusUseCaseImpl,
  );
  container.registerSingleton(OrderingTokens.GetOrderByIdUseCase, GetOrderByIdUseCaseImpl);
}
