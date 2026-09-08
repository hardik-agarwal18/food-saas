import { describe, it, expect } from 'vitest';
import { RefreshSession } from '../../../src/modules/identity/domain/entities/refresh-session.entity.js';
import { AppError } from '../../../src/shared/errors/AppError.js';
import { RefreshSessionExpiredError, RefreshSessionRevokedError } from '../../../src/modules/identity/domain/errors/index.js';

describe('RefreshSession Domain Entity', () => {
  const getFutureDate = (hours = 1) => {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    return d;
  };

  const validProps = {
    userId: 'user-123',
    familyId: 'family-456',
    tokenHash: 'hashed-token-xyz',
    expiresAt: getFutureDate(24),
  };
  
  const id = 'session-789';

  describe('creation', () => {
    it('should create a valid refresh session', () => {
      const session = RefreshSession.create(validProps, id);
      
      expect(session.getId()).toBe(id);
      expect(session.getUserId()).toBe(validProps.userId);
      expect(session.getFamilyId()).toBe(validProps.familyId);
      expect(session.getTokenHash()).toBe(validProps.tokenHash);
      expect(session.isActive()).toBe(true);
      expect(session.isExpired()).toBe(false);
      expect(session.isRevoked()).toBe(false);
      expect(session.isRotated()).toBe(false);
    });

    it('should throw if userId is missing', () => {
      expect(() => {
        RefreshSession.create({ ...validProps, userId: '' }, id);
      }).toThrow(AppError);
    });

    it('should throw if familyId is missing', () => {
      expect(() => {
        RefreshSession.create({ ...validProps, familyId: '' }, id);
      }).toThrow(AppError);
    });

    it('should throw if token hash is missing', () => {
      expect(() => {
        RefreshSession.create({ ...validProps, tokenHash: '' }, id);
      }).toThrow(AppError);
    });

    it('should throw if expiration date is in the past', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      
      expect(() => {
        RefreshSession.create({ ...validProps, expiresAt: pastDate }, id);
      }).toThrow(AppError);
    });
  });

  describe('expiration handling', () => {
    it('should correctly report expiration', () => {
      const session = RefreshSession.create(validProps, id);
      
      const futureNow = getFutureDate(48);
      expect(session.isExpired(futureNow)).toBe(true);
      expect(session.isActive(futureNow)).toBe(false);
    });

    it('should prevent markAsUsed if expired', () => {
      const session = RefreshSession.create(validProps, id);
      const futureNow = getFutureDate(48);
      
      expect(() => {
        session.markAsUsed(futureNow);
      }).toThrow(RefreshSessionExpiredError);
    });
  });

  describe('revocation handling', () => {
    it('should mark session as revoked', () => {
      const session = RefreshSession.create(validProps, id);
      session.revoke();
      
      expect(session.isRevoked()).toBe(true);
      expect(session.isActive()).toBe(false);
      expect(session.getRevokedAt()).toBeInstanceOf(Date);
    });

    it('should prevent markAsUsed if revoked', () => {
      const session = RefreshSession.create(validProps, id);
      session.revoke();
      
      expect(() => {
        session.markAsUsed();
      }).toThrow(RefreshSessionRevokedError);
    });
    
    it('should not throw if revoke is called multiple times', () => {
      const session = RefreshSession.create(validProps, id);
      const now1 = new Date();
      session.revoke(now1);
      
      const now2 = getFutureDate(1);
      session.revoke(now2);
      
      // Revocation date shouldn't change
      expect(session.getRevokedAt()).toEqual(now1);
    });
  });

  describe('rotation linkage', () => {
    it('should replace session and track replacement id', () => {
      const session = RefreshSession.create(validProps, id);
      const newSessionId = 'session-999';
      
      session.replaceWith(newSessionId);
      
      expect(session.isRevoked()).toBe(true);
      expect(session.isRotated()).toBe(true);
      expect(session.getReplacedBySessionId()).toBe(newSessionId);
    });

    it('should throw if replacing an already revoked session', () => {
      const session = RefreshSession.create(validProps, id);
      session.revoke();
      
      expect(() => {
        session.replaceWith('session-999');
      }).toThrow(RefreshSessionRevokedError);
    });
  });
});
