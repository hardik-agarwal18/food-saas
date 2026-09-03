import { DomainError } from './domain.error.js';

/**
 * Error thrown when an email address is invalid.
 */
export class InvalidEmailError extends DomainError {
  /**
   * Creates an error containing the invalid email address.
   */
  constructor(email: string) {
    super(`'${email}' is not a valid email address.`);
  }
}
