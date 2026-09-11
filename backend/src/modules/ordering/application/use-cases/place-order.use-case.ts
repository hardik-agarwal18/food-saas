import { PlaceOrderDto, OrderResponseDto } from '../dto/order.dto.js';

export interface IPlaceOrderUseCase {
  execute(customerId: string, dto: PlaceOrderDto): Promise<OrderResponseDto>;
}
