import { describe, it, expect } from 'vitest';
import { registerUserSchema } from '../../../src/modules/identity/validators/register-user.validator.js';

describe('RegisterUserValidator', () => {
  const validPayload = {
    email: 'john.doe@example.com',
    password: 'StrongPassword123!',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
  };

  describe('Valid scenarios', () => {
    it('should successfully validate a completely correct payload', () => {
      const result = registerUserSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should sanitize inputs (trim and lowercase)', () => {
      const payloadWithSpaces = {
        email: '   JOHN.DOE@EXAMPLE.COM   ',
        password: 'StrongPassword123!',
        firstName: '  John  ',
        lastName: '  Doe  ',
        phone: '  1234567890  ',
      };
      const result = registerUserSchema.safeParse(payloadWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john.doe@example.com');
        expect(result.data.firstName).toBe('john');
        expect(result.data.lastName).toBe('doe');
        expect(result.data.phone).toBe('1234567890');
      }
    });
  });

  describe('Invalid scenarios', () => {
    it('should fail if required fields are missing', () => {
      const result = registerUserSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.format();
        expect(errors).toHaveProperty('email');
        expect(errors).toHaveProperty('password');
        expect(errors).toHaveProperty('firstName');
        expect(errors).toHaveProperty('lastName');
        expect(errors).toHaveProperty('phone');
      }
    });

    it('should fail for incorrect types', () => {
      const result = registerUserSchema.safeParse({
        ...validPayload,
        phone: 1234567890, // Should be string
      });
      expect(result.success).toBe(false);
    });

    it('should fail for invalid email', () => {
      const result = registerUserSchema.safeParse({ ...validPayload, email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address.');
      }
    });

    it('should fail for weak password (less than 6 chars)', () => {
      const result = registerUserSchema.safeParse({ ...validPayload, password: '12345' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Password must be at least 6');
      }
    });

    it('should fail for empty strings on required fields', () => {
      const result = registerUserSchema.safeParse({ ...validPayload, firstName: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('First name cannot be empty');
      }
    });

    it('should fail for empty phone number', () => {
      const result = registerUserSchema.safeParse({ ...validPayload, phone: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Phone number cannot be empty');
      }
    });

    it('should fail if extra fields are provided (strict object)', () => {
      const result = registerUserSchema.safeParse({
        ...validPayload,
        extraField: 'should not be here',
      });
      expect(result.success).toBe(false);
    });

    it('should fail for boundary values (firstName > 100 chars)', () => {
      const result = registerUserSchema.safeParse({
        ...validPayload,
        firstName: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });
    
    it('should fail for boundary values (phone > 20 chars)', () => {
      const result = registerUserSchema.safeParse({
        ...validPayload,
        phone: '1'.repeat(21),
      });
      expect(result.success).toBe(false);
    });
  });
});
