import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';

/**
 * Error thrown when a refresh session does not exist.
 */
export class RefreshSessionNotFound extends AuthenticationError {
  /**
   * Creates the refresh-session-not-found error.
   */
  constructor() {
    super('Refresh session not found.');
  }
}
