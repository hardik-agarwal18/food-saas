export class OrderingDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderingDomainError';
  }
}
