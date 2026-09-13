import { CustomerDomainError } from '../errors/customer-domain.error.js';

export class CustomerAddressLabel {
  private readonly value: string;

  constructor(value: string) {
    this.value = CustomerAddressLabel.validate(value);
  }

  public getValue(): string {
    return this.value;
  }

  private static validate(value: string): string {
    if (typeof value !== 'string') {
      throw new CustomerDomainError('Address label must be a string');
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new CustomerDomainError('Address label cannot be empty');
    }

    if (trimmed.length > 50) {
      throw new CustomerDomainError('Address label must be 50 characters or less');
    }

    return trimmed;
  }
}
