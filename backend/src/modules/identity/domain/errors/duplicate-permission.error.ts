import { DomainError } from './domain.error.js';

/**
 * Error thrown when a permission is added more than once.
 */
export class DuplicatePermissionError extends DomainError {
  /**
   * Creates an error containing the duplicate permission name.
   */
  constructor(permission: string) {
    super(`Permission '${permission}' already exists.`);
  }
}
