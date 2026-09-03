import { DomainError } from './domain.error.js';

/**
 * Error thrown when a refresh session does not exist.
 */
export class RefreshSessionNotFound extends DomainError {
  /**
   * Creates the refresh-session-not-found error.
   */
  constructor() {
    super('Refresh session not found.');
  }
}
