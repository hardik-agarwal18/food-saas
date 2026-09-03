import { AppError } from './AppError.js';

/**
 * Represents a conflict with the current state of a resource.
 *
 * Examples:
 *
 * - Creating a user with an email that already exists.
 * - Updating a record that has already been modified.
 * - Attempting an operation that violates a business rule.
 *
 * HTTP status:
 * 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    // The conflict is expected and can be safely handled by
    // the API error middleware.
    super(
      // The current implementation replaces the supplied message
      // with "Conflict".
      (message = 'Conflict'),
      409,
      'CONFLICT',
      true,
    );
  }
}
