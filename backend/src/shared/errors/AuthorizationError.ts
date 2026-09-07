import { AppError } from './AppError.js';

/**
 * Represents a request where the user is authenticated but
 * does not have permission to perform the requested operation.
 *
 * Example:
 *
 * A logged-in user attempts to access an administrator-only endpoint.
 *
 * HTTP status:
 * 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string) {
    // This error means the identity may be known, but the user
    // is not allowed to perform the requested action.
    super(message, 403, 'AUTHORIZATION_ERROR', true);
  }
}
