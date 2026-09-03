import { DomainError } from './domain.error.js';

/**
 * Error thrown when a required role has not been assigned to a user.
 */
export class RoleNotAssignedError extends DomainError {
  /**
   * Creates an error containing the missing role name.
   */
  constructor(role: string) {
    super(`${role} is not assigned.`);
  }
}
