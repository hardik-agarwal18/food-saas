import { injectable, inject } from 'tsyringe';
import type { IGetCustomerOrdersUseCase } from './get-customer-orders.use-case.js';
import { OrderResponseDto } from '../dto/order.dto.js';
import { OrderDtoMapper } from '../mappers/order-dto.mapper.js';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type {
  IOrderRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../domain/repositories/order.repository.js';

@injectable()
export class GetCustomerOrdersUseCaseImpl implements IGetCustomerOrdersUseCase {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(
    customerId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const result = await this.orderRepo.findByCustomerId(customerId, options);

    return {
      data: result.data.map(OrderDtoMapper.toResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
