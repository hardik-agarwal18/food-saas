import { DomainError } from './domain.error.js';

/**
 * Error thrown when a JWT roles claim is invalid.
 */
export class JWTInvalidRolesClaimError extends DomainError {
  constructor() {
    super('Invalid JWT roles claim');
  }
}
