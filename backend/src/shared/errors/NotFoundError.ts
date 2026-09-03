import { AppError } from './AppError.js';

/**
 * Represents a requested resource that could not be found.
 *
 * Examples:
 *
 * - A restaurant ID does not exist.
 * - An order cannot be found.
 * - A requested user does not exist.
 *
 * HTTP status:
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    // The current implementation replaces the supplied message
    // with the default "Resource Not Found" message.
    super(
      (message = 'Resource Not Found'),
      404,

      'NOT_FOUND',

      true,
    );
  }
}
