import { DomainError } from './domain.error.js';

/**
 * Error thrown when a JWT subject is missing.
 */
export class JwtInvalidTokenTypeError extends DomainError {
  /**
   * Creates the JWT invalid token type error.
   */
  constructor() {
    super('JWT invalid token type.');
  }
}
