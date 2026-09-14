import { injectable, inject } from 'tsyringe';
import type { IGetOrderByIdUseCase } from './get-order-by-id.use-case.js';
import { OrderResponseDto } from '../dto/order.dto.js';
import { OrderDtoMapper } from '../mappers/order-dto.mapper.js';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { CustomerTokens } from '../../../customer/infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.js';
import { OrderingDomainError } from '../../domain/errors/ordering-domain.error.js';
import { Role } from '../../../identity/domain/enums/role.enum.js';

@injectable()
export class GetOrderByIdUseCaseImpl implements IGetOrderByIdUseCase {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(orderId: string, actorId: string, actorRoles: string[]): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new OrderingDomainError('Order not found');
    }

    // Admins can see any order
    if (actorRoles.includes(Role.ADMIN)) {
      return OrderDtoMapper.toResponse(order);
    }

    // Customers can only see their own orders
    if (actorRoles.includes(Role.CUSTOMER)) {
      const customer = await this.customerRepo.findByUserId(actorId);
      if (customer && customer.getId() === order.getCustomerId()) {
        return OrderDtoMapper.toResponse(order);
      }
    }

    // Restaurant owners can only see orders for their restaurants
    if (actorRoles.includes(Role.RESTAURANT_OWNER)) {
      const restaurant = await this.restaurantRepo.findById(order.getRestaurantId());
      if (restaurant && restaurant.getOwnerId() === actorId) {
        return OrderDtoMapper.toResponse(order);
      }
    }

    throw new OrderingDomainError('Unauthorized access to order');
  }
}
