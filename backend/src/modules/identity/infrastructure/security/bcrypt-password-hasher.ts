import bcrypt from 'bcrypt';

import { env } from '../../../../config/env.config.js';
import { IPasswordHasher } from '../../domain/services/password-hasher.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo.js';

/**
 * Password-hasher implementation backed by bcrypt.
 *
 * This class belongs to the infrastructure layer and implements the
 * domain-level IPasswordHasher contract.
 *
 * The number of bcrypt salt rounds is read from the application
 * environment configuration rather than being hardcoded here.
 */
export class BcryptPasswordHasher implements IPasswordHasher {
  /**
   * Hashes a plain-text password using bcrypt.
   *
   * bcrypt automatically generates and incorporates a salt into the
   * resulting hash. The configured salt-round value controls the
   * computational cost of the hashing operation.
   *
   * @param password - The plain-text password to hash.
   * @returns A promise containing the generated PasswordHash value object.
   */
  async hashPassword(password: string): Promise<PasswordHash> {
    const hash = await bcrypt.hash(password, env.SALT_ROUNDS);

    return PasswordHash.create(hash);
  }

  /**
   * Compares a plain-text password with a previously generated hash.
   *
   * bcrypt extracts the salt and hashing parameters from the stored
   * hash and performs the comparison internally.
   *
   * @param password - The plain-text password supplied for verification.
   * @param passwordHash - The stored password hash value object.
   * @returns A promise that resolves to true when the password matches;
   * otherwise, false.
   */
  async comparePassword(password: string, passwordHash: PasswordHash): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash.getValue());
  }
}
