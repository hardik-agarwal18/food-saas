import { describe, expect, it } from 'vitest';

import { BcryptPasswordHasher } from '../../../src/modules/identity/infrastructure/security/bcrypt-password-hasher.js';

import { PasswordHash } from '../../../src/modules/identity/domain/value-objects/password-hash.vo.js';

/**
 * Integration tests for the BcryptPasswordHasher service.
 *
 * These tests verify that the bcrypt-based implementation:
 *
 * - Generates a valid PasswordHash value object.
 * - Does not return the original plain-text password.
 * - Produces different hashes for the same password.
 * - Successfully verifies the correct password.
 * - Rejects an incorrect password.
 */
describe('BcryptPasswordHasher', () => {
  /**
   * The password-hasher instance shared by all tests in this suite.
   *
   * BcryptPasswordHasher does not maintain test-specific state, so the
   * same instance can safely be reused across test cases.
   */
  const passwordHasher = new BcryptPasswordHasher();

  /**
   * Verifies that hashing a password returns a valid PasswordHash object.
   *
   * The generated hash must not be equal to the original password.
   * It must also satisfy the validation rules defined by the PasswordHash
   * value object.
   */
  it('should hash a password', async () => {
    const password = 'StrongPassword123!';

    const passwordHash = await passwordHasher.hashPassword(password);

    expect(passwordHash).toBeInstanceOf(PasswordHash);
    expect(passwordHash.getValue()).not.toBe(password);
    expect(PasswordHash.isValid(passwordHash.getValue())).toBe(true);
  });

  /**
   * Verifies that hashing the same password twice produces different hashes.
   *
   * bcrypt generates a new random salt for each hashing operation.
   * Therefore, identical passwords should not produce identical hash
   * strings.
   */
  it('should generate different hashes for the same password', async () => {
    const password = 'StrongPassword123!';

    const hash1 = await passwordHasher.hashPassword(password);
    const hash2 = await passwordHasher.hashPassword(password);

    expect(hash1.getValue()).not.toBe(hash2.getValue());
  });

  /**
   * Verifies that a password can be successfully compared with its hash.
   *
   * The comparison should return true when the plain-text password is
   * the same password that was used to generate the stored hash.
   */
  it('should return true for the correct password', async () => {
    const password = 'StrongPassword123!';

    const passwordHash = await passwordHasher.hashPassword(password);

    const result = await passwordHasher.comparePassword(password, passwordHash);

    expect(result).toBe(true);
  });

  /**
   * Verifies that password comparison fails for an incorrect password.
   *
   * The comparison should return false when the supplied password does
   * not match the password represented by the stored hash.
   */
  it('should return false for the incorrect password', async () => {
    const password = 'StrongPassword123!';
    const wrongPassword = 'WrongPassword123!';

    const passwordHash = await passwordHasher.hashPassword(password);

    const result = await passwordHasher.comparePassword(wrongPassword, passwordHash);

    expect(result).toBe(false);
  });
});
