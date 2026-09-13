import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerAddressRepository } from '../../domain/repositories/customer-address.repository.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { CustomerAddress } from '../../domain/entities/customer-address.entity.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';

export interface IGetCustomerAddressesUseCase {
  execute(userId: string): Promise<CustomerAddress[]>;
}

@injectable()
export class GetCustomerAddressesUseCaseImpl implements IGetCustomerAddressesUseCase {
  constructor(
    @inject(CustomerTokens.CustomerAddressRepository)
    private readonly addressRepo: ICustomerAddressRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(userId: string): Promise<CustomerAddress[]> {
    const customer = await this.customerRepo.findByUserId(userId);
    if (!customer) {
      throw new CustomerNotFoundError();
    }

    return this.addressRepo.findByCustomerId(customer.getId());
  }
}
