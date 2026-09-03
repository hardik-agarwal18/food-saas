import { AppError } from './AppError.js';

/**
 * Represents a request that is invalid or malformed.
 *
 * This error is appropriate when the server understands the request
 * but cannot process it because the input is invalid.
 *
 * Examples:
 *
 * - A required field is missing.
 * - A query parameter has an invalid format.
 * - A request contains an invalid combination of values.
 *
 * HTTP status:
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string) {
    // The caller must provide the explanation because this class
    // does not define a default message.
    super(message, 400, 'BAD_REQUEST', true);
  }
}
