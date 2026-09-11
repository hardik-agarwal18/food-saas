import { container } from 'tsyringe';
import { OrderingTokens } from '../../../modules/ordering/infrastructure/tokens/ordering.tokens.js';
import { OrderRepositoryImpl } from '../../../modules/ordering/infrastructure/persistence/prisma/order.repository.js';
import { PlaceOrderUseCaseImpl } from '../../../modules/ordering/application/use-cases/place-order.use-case.impl.js';
import { GetCustomerOrdersUseCaseImpl } from '../../../modules/ordering/application/use-cases/get-customer-orders.use-case.impl.js';
import { GetRestaurantOrdersUseCaseImpl } from '../../../modules/ordering/application/use-cases/get-restaurant-orders.use-case.impl.js';
import { UpdateOrderStatusUseCaseImpl } from '../../../modules/ordering/application/use-cases/update-order-status.use-case.impl.js';

// Dynamically add use case tokens
(OrderingTokens as any).PlaceOrderUseCase = Symbol.for('Ordering.PlaceOrderUseCase');
(OrderingTokens as any).GetCustomerOrdersUseCase = Symbol.for('Ordering.GetCustomerOrdersUseCase');
(OrderingTokens as any).GetRestaurantOrdersUseCase = Symbol.for(
  'Ordering.GetRestaurantOrdersUseCase',
);
(OrderingTokens as any).UpdateOrderStatusUseCase = Symbol.for('Ordering.UpdateOrderStatusUseCase');

export function registerOrdering(): void {
  // Repositories
  container.registerSingleton(OrderingTokens.OrderRepository, OrderRepositoryImpl);

  // Use Cases
  container.registerSingleton((OrderingTokens as any).PlaceOrderUseCase, PlaceOrderUseCaseImpl);
  container.registerSingleton(
    (OrderingTokens as any).GetCustomerOrdersUseCase,
    GetCustomerOrdersUseCaseImpl,
  );
  container.registerSingleton(
    (OrderingTokens as any).GetRestaurantOrdersUseCase,
    GetRestaurantOrdersUseCaseImpl,
  );
  container.registerSingleton(
    (OrderingTokens as any).UpdateOrderStatusUseCase,
    UpdateOrderStatusUseCaseImpl,
  );
}
