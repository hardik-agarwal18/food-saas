import { PasswordHash } from '../value-objects/password-hash.vo.js';

/**
 * Defines the contract for password hashing and password verification.
 *
 * This interface belongs to the domain layer and hides the concrete
 * hashing algorithm from the rest of the application.
 *
 * Infrastructure implementations, such as a bcrypt-based hasher,
 * must implement this contract.
 */
export interface IPasswordHasher {
  /**
   * Hashes a plain-text password.
   *
   * The returned value is wrapped in the PasswordHash value object
   * so that password hashes are represented consistently throughout
   * the domain.
   *
   * @param password - The plain-text password to hash.
   * @returns A promise containing the resulting PasswordHash.
   */
  hashPassword(password: string): Promise<PasswordHash>;

  /**
   * Checks whether a plain-text password matches an existing hash.
   *
   * The comparison is performed by the concrete implementation.
   * The plain-text password must not be stored or returned.
   *
   * @param password - The plain-text password supplied by the user.
   * @param passwordHash - The previously generated password hash.
   * @returns A promise that resolves to true when the password matches;
   * otherwise, false.
   */
  comparePassword(password: string, passwordHash: PasswordHash): Promise<boolean>;
}
