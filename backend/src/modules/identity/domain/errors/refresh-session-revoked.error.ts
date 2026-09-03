import { DomainError } from './domain.error.js';

/**
 * Error thrown when a refresh session has been revoked.
 */
export class RefreshSessionRevokedError extends DomainError {
  /**
   * Creates the refresh-session-revoked error.
   */
  constructor() {
    super('Refresh session is revoked.');
  }
}
