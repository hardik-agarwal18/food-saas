import { describe, it, expect } from 'vitest';
import { BcryptPasswordHasher } from '../../../src/modules/identity/infrastructure/security/bcrypt-password-hasher.js';
import { PasswordHash } from '../../../src/modules/identity/domain/value-objects/password-hash.vo.js';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  describe('hashPassword', () => {
    it('should correctly hash a valid password', async () => {
      const password = 'StrongPassword123!';
      const hash = await hasher.hashPassword(password);
      
      expect(hash).toBeInstanceOf(PasswordHash);
      expect(hash.getValue().length).toBeGreaterThan(0);
      expect(PasswordHash.isValid(hash.getValue())).toBe(true);
    });

    it('should reject an empty password before hashing', async () => {
      await expect(hasher.hashPassword('')).rejects.toThrow('Password cannot be empty');
      await expect(hasher.hashPassword('   ')).rejects.toThrow('Password cannot be empty');
    });

    it('should produce different hashes for the same password due to salting', async () => {
      const password = 'StrongPassword123!';
      const hash1 = await hasher.hashPassword(password);
      const hash2 = await hasher.hashPassword(password);
      
      expect(hash1.getValue()).not.toBe(hash2.getValue());
    });

    it('should produce a valid hash format (bcrypt format)', async () => {
      const password = 'StrongPassword123!';
      const hash = await hasher.hashPassword(password);
      
      expect(PasswordHash.isValid(hash.getValue())).toBe(true);
      // Cost factor should be included in the bcrypt hash output, matching env config (12 default)
      expect(hash.getValue().startsWith('$2b$12$')).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('should return true for the correct password', async () => {
      const password = 'CorrectPassword999';
      const hash = await hasher.hashPassword(password);
      
      const result = await hasher.comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for an incorrect password', async () => {
      const password = 'CorrectPassword999';
      const hash = await hasher.hashPassword(password);
      
      const result = await hasher.comparePassword('WrongPassword', hash);
      expect(result).toBe(false);
    });
  });
});
