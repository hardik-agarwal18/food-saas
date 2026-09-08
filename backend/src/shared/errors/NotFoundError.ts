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
  constructor(message: string = 'Resource Not Found', code: string = 'NOT_FOUND') {
    super(message, 404, code, true);
  }
}
