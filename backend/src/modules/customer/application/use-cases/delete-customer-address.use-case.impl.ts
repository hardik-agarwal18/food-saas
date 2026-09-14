import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerAddressRepository } from '../../domain/repositories/customer-address.repository.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';
import { AuthorizationError } from '../../../../shared/errors/AuthorizationError.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';

export interface IDeleteCustomerAddressUseCase {
  execute(params: { addressId: string; userId: string }): Promise<void>;
}

@injectable()
export class DeleteCustomerAddressUseCaseImpl implements IDeleteCustomerAddressUseCase {
  constructor(
    @inject(CustomerTokens.CustomerAddressRepository)
    private readonly addressRepo: ICustomerAddressRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(params: { addressId: string; userId: string }): Promise<void> {
    const customer = await this.customerRepo.findByUserId(params.userId);
    if (!customer) {
      throw new CustomerNotFoundError();
    }

    const address = await this.addressRepo.findById(params.addressId);

    if (!address) {
      throw new NotFoundError('Customer address not found');
    }

    if (address.getCustomerId() !== customer.getId()) {
      throw new AuthorizationError('Unauthorized to delete this address');
    }

    await this.addressRepo.delete(params.addressId);

    // If we deleted the default address, we might want to make another one default
    if (address.getIsDefault()) {
      const remaining = await this.addressRepo.findByCustomerId(customer.getId());
      if (remaining.length > 0) {
        const nextDefault = remaining[0];
        nextDefault.setDefault();
        await this.addressRepo.save(nextDefault);
      }
    }
  }
}
