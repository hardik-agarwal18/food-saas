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
import { CustomerTokens } from '../../../customer/infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.js';
import { OrderingDomainError } from '../../domain/errors/ordering-domain.error.js';

@injectable()
export class GetCustomerOrdersUseCaseImpl implements IGetCustomerOrdersUseCase {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(
    userId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const customer = await this.customerRepo.findByUserId(userId);
    if (!customer) {
      throw new OrderingDomainError('Customer profile not found');
    }

    const result = await this.orderRepo.findByCustomerId(customer.getId(), options);

    return {
      data: result.data.map(OrderDtoMapper.toResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
