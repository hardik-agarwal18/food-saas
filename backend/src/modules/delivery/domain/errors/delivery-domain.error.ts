export class DeliveryDomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'DELIVERY_DOMAIN_ERROR') {
    super(message);
    this.name = 'DeliveryDomainError';
    this.code = code;
  }

  static invalidStatusTransition(from: string, to: string): DeliveryDomainError {
    return new DeliveryDomainError(
      `Invalid delivery status transition from ${from} to ${to}`,
      'INVALID_DELIVERY_STATUS_TRANSITION',
    );
  }

  static alreadyClaimed(): DeliveryDomainError {
    return new DeliveryDomainError(
      'This delivery assignment has already been claimed by another driver.',
      'DELIVERY_ALREADY_CLAIMED',
    );
  }

  static unassignedDriverAction(): DeliveryDomainError {
    return new DeliveryDomainError(
      'A driver must be assigned before taking this action.',
      'UNASSIGNED_DRIVER_ACTION',
    );
  }

  static unauthorizedDriver(): DeliveryDomainError {
    return new DeliveryDomainError(
      'You are not authorized to perform actions on this delivery assignment.',
      'UNAUTHORIZED_DRIVER',
    );
  }
}
