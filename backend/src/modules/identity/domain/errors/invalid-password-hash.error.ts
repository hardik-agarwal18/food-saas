import { DomainError } from './domain.error.js';

/**
 * Error thrown when a password hash is invalid.
 */
export class InvalidPasswordHashError extends DomainError {
  /**
   * Creates the invalid-password-hash error.
   */
  constructor() {
    super('The provided password hash is invalid');
  }
}
