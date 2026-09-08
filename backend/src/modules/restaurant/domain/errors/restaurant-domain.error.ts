export class RestaurantDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RestaurantDomainError';
  }
}
