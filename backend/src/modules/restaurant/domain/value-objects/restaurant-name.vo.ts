import { RestaurantDomainError } from '../errors/restaurant-domain.error.js';

export class RestaurantName {
  private readonly value: string;

  constructor(value: string) {
    this.value = RestaurantName.validate(value);
  }

  public getValue(): string {
    return this.value;
  }

  private static validate(value: string): string {
    if (typeof value !== 'string') {
      throw new RestaurantDomainError('Restaurant name must be a string');
    }

    const trimmed = value.trim();

    if (trimmed.length < 2) {
      throw new RestaurantDomainError('Restaurant name must be at least 2 characters long');
    }

    if (trimmed.length > 150) {
      throw new RestaurantDomainError('Restaurant name cannot exceed 150 characters');
    }

    return trimmed;
  }
}
