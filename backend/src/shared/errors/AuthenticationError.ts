import { AppError } from './AppError.js';

/**
 * Represents a request made without valid authentication.
 *
 * This error is normally used when:
 *
 * - No access token was provided.
 * - The access token is invalid.
 * - The access token has expired.
 * - The user session cannot be verified.
 *
 * HTTP status:
 * 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message: string) {
    // The error is operational because an unauthenticated request
    // is an expected application-level failure.
    super(
      // The current implementation assigns the default message
      // to the parameter before passing it to AppError.
      (message = 'Authentication required'),
      401,
      'AUTHENTICATION_ERROR',
      true,
    );
  }
}
