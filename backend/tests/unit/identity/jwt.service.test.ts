import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { JwtService } from '../../../src/modules/identity/infrastructure/security/jwt/jwt.service.js';
import { Role, UserStatus } from '../../../src/modules/identity/domain/enums/index.js';
import { ITokenPayload } from '../../../src/modules/identity/domain/services/token-payload.js';
import jwt from 'jsonwebtoken';
import { env } from '../../../src/config/env.config.js';

describe('JwtService', () => {
  let jwtService: JwtService;

  const validPayload: ITokenPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    type: 'ACCESS_TOKEN' as any,
    roles: [Role.CUSTOMER],
  };

  beforeAll(() => {
    jwtService = new JwtService();
  });

  describe('signAccessToken & verifyAccessToken', () => {
    it('should generate a valid token and verify it correctly', async () => {
      const token = await jwtService.signAccessToken(validPayload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      const decoded = await jwtService.verifyAccessToken(token);
      expect(decoded.sub).toBe(validPayload.sub);
      expect(decoded.type).toBe('ACCESS');
    });

    it('should fail verification if signature is invalid', async () => {
      const token = await jwtService.signAccessToken(validPayload);
      const parts = token.split('.');
      parts[2] = 'invalid-signature-part';
      const tamperedToken = parts.join('.');

      await expect(jwtService.verifyAccessToken(tamperedToken)).rejects.toThrow();
    });

    it('should fail verification for a malformed token', async () => {
      await expect(jwtService.verifyAccessToken('not.a.valid.jwt')).rejects.toThrow();
    });

    it('should fail if token is expired', async () => {
      // Create a token that is already expired using raw jsonwebtoken
      const expiredToken = jwt.sign(validPayload, env.JWT_ACCESS_SECRET!, {
        expiresIn: '-1s',
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });

      await expect(jwtService.verifyAccessToken(expiredToken)).rejects.toThrow();
    });

    it('should fail if issuer is wrong', async () => {
      const wrongIssuerToken = jwt.sign(validPayload, env.JWT_ACCESS_SECRET!, {
        expiresIn: '1h',
        issuer: 'wrong-issuer',
        audience: env.JWT_AUDIENCE,
      });

      await expect(jwtService.verifyAccessToken(wrongIssuerToken)).rejects.toThrow();
    });

    it('should fail if audience is wrong', async () => {
      const wrongAudienceToken = jwt.sign(validPayload, env.JWT_ACCESS_SECRET!, {
        expiresIn: '1h',
        issuer: env.JWT_ISSUER,
        audience: 'wrong-audience',
      });

      await expect(jwtService.verifyAccessToken(wrongAudienceToken)).rejects.toThrow();
    });

    it('should fail if required claims are missing', async () => {
      const missingClaimsToken = jwt.sign({ foo: 'bar' }, env.JWT_ACCESS_SECRET!, {
        expiresIn: '1h',
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });

      await expect(jwtService.verifyAccessToken(missingClaimsToken)).rejects.toThrow();
    });
    
    it('should fail if token type is incorrect', async () => {
       const refreshToken = await jwtService.signRefreshToken(validPayload);
       // Should reject because refresh token uses a different secret
       await expect(jwtService.verifyAccessToken(refreshToken)).rejects.toThrow();
    });
  });
});
