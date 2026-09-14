export const OrderingTokens = {
  OrderRepository: Symbol.for('Ordering.OrderRepository'),
  PlaceOrderUseCase: Symbol.for('Ordering.PlaceOrderUseCase'),
  GetCustomerOrdersUseCase: Symbol.for('Ordering.GetCustomerOrdersUseCase'),
  GetRestaurantOrdersUseCase: Symbol.for('Ordering.GetRestaurantOrdersUseCase'),
  UpdateOrderStatusUseCase: Symbol.for('Ordering.UpdateOrderStatusUseCase'),
  GetOrderByIdUseCase: Symbol.for('Ordering.GetOrderByIdUseCase'),
  GetRestaurantAnalyticsUseCase: Symbol.for('Ordering.GetRestaurantAnalyticsUseCase'),
};
