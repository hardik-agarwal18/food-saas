import { OrderResponseDto } from '../dto/order.dto.js';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/order.repository.js';

export interface IGetCustomerOrdersUseCase {
  execute(
    customerId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<OrderResponseDto>>;
}
