import { AppError } from './AppError.js';

/**
 * Represents an internal server failure.
 *
 * This error is used when the server cannot complete the request
 * because of an unexpected or internal problem.
 *
 * Examples:
 *
 * - An unexpected database failure.
 * - A required internal service is unavailable.
 * - An unhandled application failure.
 *
 * HTTP status:
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string) {
    // The current implementation replaces the supplied message
    // with the default internal server error message.
    super((message = 'Internal server error'), 500, 'INTERNAL_SERVER_ERROR', true);
  }
}
