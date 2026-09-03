import { DomainError } from './domain.error.js';

/**
 * Error thrown when a user already has the specified role.
 */
export class DuplicateRoleError extends DomainError {
  /**
   * Creates an error containing the duplicate role name.
   */
  constructor(role: string) {
    super(`User already has the '${role}' role.`);
  }
}
