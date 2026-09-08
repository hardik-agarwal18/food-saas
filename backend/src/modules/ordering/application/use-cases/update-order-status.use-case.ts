import { OrderResponseDto } from '../dto/order.dto.js';
import { OrderStatus } from '../../../../generated/prisma/client.js';

export interface IUpdateOrderStatusUseCase {
  execute(
    orderId: string,
    restaurantId: string,
    userId: string,
    status: OrderStatus,
  ): Promise<OrderResponseDto>;
}
