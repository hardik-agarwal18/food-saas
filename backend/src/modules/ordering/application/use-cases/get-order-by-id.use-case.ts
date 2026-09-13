import { OrderResponseDto } from '../dto/order.dto.js';

export interface IGetOrderByIdUseCase {
  execute(orderId: string, actorId: string, actorRoles: string[]): Promise<OrderResponseDto>;
}
