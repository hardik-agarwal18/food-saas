import { CustomerAddress } from '../entities/customer-address.entity.js';

export interface ICustomerAddressRepository {
  save(address: CustomerAddress): Promise<void>;
  findById(id: string): Promise<CustomerAddress | null>;
  findByCustomerId(customerId: string): Promise<CustomerAddress[]>;
  delete(id: string): Promise<void>;
  resetDefaultAddress(customerId: string): Promise<void>;
}
