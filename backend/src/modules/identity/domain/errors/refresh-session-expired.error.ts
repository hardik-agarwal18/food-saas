import { DomainError } from './domain.error.js';

/**
 * Error thrown when a refresh session has expired.
 */
export class RefreshSessionExpiredError extends DomainError {
  /**
   * Creates the refresh-session-expired error.
   */
  constructor() {
    super('Refresh session has expired');
  }
}
