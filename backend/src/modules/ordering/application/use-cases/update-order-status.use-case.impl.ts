import { injectable, inject } from 'tsyringe';
import type { IUpdateOrderStatusUseCase } from './update-order-status.use-case.js';
import { OrderResponseDto } from '../dto/order.dto.js';
import { OrderDtoMapper } from '../mappers/order-dto.mapper.js';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { OrderingDomainError } from '../../domain/errors/ordering-domain.error.js';
import { OrderStatus } from '../../../../generated/prisma/client.js';

@injectable()
export class UpdateOrderStatusUseCaseImpl implements IUpdateOrderStatusUseCase {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(
    orderId: string,
    restaurantId: string,
    userId: string,
    status: OrderStatus,
  ): Promise<OrderResponseDto> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant || restaurant.getOwnerId() !== userId) {
      throw new OrderingDomainError('Unauthorized access to update this order');
    }

    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new OrderingDomainError('Order not found');
    }

    if (order.getRestaurantId() !== restaurantId) {
      throw new OrderingDomainError('Order does not belong to this restaurant');
    }

    // Role-specific transition logic owned by aggregate
    switch (status) {
      case OrderStatus.ACCEPTED:
        order.accept();
        break;
      case OrderStatus.PREPARING:
        order.startPreparing();
        break;
      case OrderStatus.READY:
        order.markReady();
        break;
      case OrderStatus.CANCELLED:
        order.cancel();
        break;
      default:
        // Restaurant owner cannot mark as OUT_FOR_DELIVERY or DELIVERED (handled by driver, unless pickup)
        if (order.getOrderType() === 'PICKUP' && status === OrderStatus.DELIVERED) {
          order.markDelivered();
        } else {
          throw new OrderingDomainError(`Restaurant cannot directly set status to ${status}`);
        }
    }

    await this.orderRepo.update(order);

    return OrderDtoMapper.toResponse(order);
  }
}
