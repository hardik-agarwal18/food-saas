import { DomainError } from './domain.error.js';

/**
 * Error thrown when a JWT subject is missing.
 */
export class JwtSubjectMissingError extends DomainError {
  /**
   * Creates the JWT subject-missing error.
   */
  constructor() {
    super('JWT subject is missing.');
  }
}
