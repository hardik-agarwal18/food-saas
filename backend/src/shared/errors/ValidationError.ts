import { ValidationIssue } from '../validation/validation-error.js';
import { AppError } from './AppError.js';

/**
 * Represents a request that failed input validation.
 *
 * Unlike a normal BadRequestError, this error also carries
 * field-level validation details.
 *
 * Example:
 *
 * [
 *   {
 *     path: 'email',
 *     message: 'Email is invalid',
 *   },
 *   {
 *     path: 'password',
 *     message: 'Password is too short',
 *   },
 * ]
 *
 * HTTP status:
 * 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(
    /**
     * Collection of individual validation problems.
     *
     * Each issue identifies the invalid field and explains
     * what is wrong with it.
     */
    public readonly details: ValidationIssue[],
  ) {
    // Validation failures are expected client-side input errors.
    super('Validation failed', 400, 'VALIDATION_ERROR', true);
  }
}
