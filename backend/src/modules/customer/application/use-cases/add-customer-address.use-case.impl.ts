import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerAddressRepository } from '../../domain/repositories/customer-address.repository.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { CustomerAddress } from '../../domain/entities/customer-address.entity.js';
import { CustomerAddressLabel } from '../../domain/value-objects/customer-address-label.vo.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';

export interface IAddCustomerAddressUseCase {
  execute(params: {
    userId: string;
    label: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }): Promise<CustomerAddress>;
}

@injectable()
export class AddCustomerAddressUseCaseImpl implements IAddCustomerAddressUseCase {
  constructor(
    @inject(CustomerTokens.CustomerAddressRepository)
    private readonly addressRepo: ICustomerAddressRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(params: {
    userId: string;
    label: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }): Promise<CustomerAddress> {
    const customer = await this.customerRepo.findByUserId(params.userId);
    if (!customer) {
      throw new CustomerNotFoundError();
    }

    const customerId = customer.getId();
    const labelVo = new CustomerAddressLabel(params.label);

    // Check if we need to reset existing defaults
    if (params.isDefault) {
      await this.addressRepo.resetDefaultAddress(customerId);
    }

    const address = CustomerAddress.create({
      customerId: customerId,
      label: labelVo,
      streetAddress: params.streetAddress,
      city: params.city,
      state: params.state,
      zipCode: params.zipCode,
      country: params.country,
      latitude: params.latitude,
      longitude: params.longitude,
      isDefault: params.isDefault,
    });

    // If it's the first address, make it default automatically
    if (!params.isDefault) {
      const existing = await this.addressRepo.findByCustomerId(customerId);
      if (existing.length === 0) {
        address.setDefault();
      }
    }

    await this.addressRepo.save(address);

    return address;
  }
}
