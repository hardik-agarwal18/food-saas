import { DomainError } from './domain.error.js';

/**
 * Error thrown when an email address has already been verified.
 */
export class EmailAlreadyVerifiedError extends DomainError {
  /**
   * Creates the email-already-verified error.
   */
  constructor() {
    super(`Email already verified.`);
  }
}
