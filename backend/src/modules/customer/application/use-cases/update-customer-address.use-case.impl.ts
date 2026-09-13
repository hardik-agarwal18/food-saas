import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerAddressRepository } from '../../domain/repositories/customer-address.repository.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { CustomerAddress } from '../../domain/entities/customer-address.entity.js';
import { CustomerAddressLabel } from '../../domain/value-objects/customer-address-label.vo.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';
import { AuthorizationError } from '../../../../shared/errors/AuthorizationError.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';

export interface IUpdateCustomerAddressUseCase {
  execute(params: {
    addressId: string;
    userId: string;
    label?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<CustomerAddress>;
}

@injectable()
export class UpdateCustomerAddressUseCaseImpl implements IUpdateCustomerAddressUseCase {
  constructor(
    @inject(CustomerTokens.CustomerAddressRepository)
    private readonly addressRepo: ICustomerAddressRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(params: {
    addressId: string;
    userId: string;
    label?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<CustomerAddress> {
    const customer = await this.customerRepo.findByUserId(params.userId);
    if (!customer) {
      throw new CustomerNotFoundError();
    }

    const address = await this.addressRepo.findById(params.addressId);

    if (!address) {
      throw new NotFoundError('Customer address not found');
    }

    if (address.getCustomerId() !== customer.getId()) {
      throw new AuthorizationError('Unauthorized to update this address');
    }

    address.update({
      label: params.label ? new CustomerAddressLabel(params.label) : undefined,
      streetAddress: params.streetAddress,
      city: params.city,
      state: params.state,
      zipCode: params.zipCode,
      country: params.country,
      latitude: params.latitude,
      longitude: params.longitude,
    });

    await this.addressRepo.save(address);

    return address;
  }
}
