import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app/app.js';
import { createTestUser } from '../../factories/user.factory.js';
import { generateTestAccessToken } from '../../helpers/auth.helper.js';
import { prisma } from '../../../src/infrastructure/database/prisma.js';

describe('Authentication Middleware (HTTP)', () => {

  describe('GET /api/v1/identity/me (Protected Route)', () => {
    it('should return 401 if authorization header is missing', async () => {
      const response = await request(app).get('/api/v1/identity/me');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 401 if bearer token is malformed', async () => {
      const response = await request(app)
        .get('/api/v1/identity/me')
        .set('Authorization', 'NotBearer SomeToken123');
        
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 401 if token signature is invalid', async () => {
      const user = await createTestUser(prisma);
      const token = await generateTestAccessToken(user);
      const tamperedToken = token.slice(0, -5) + 'abcde';

      const response = await request(app)
        .get('/api/v1/identity/me')
        .set('Authorization', `Bearer ${tamperedToken}`);
        
      expect(response.status).toBe(401);
      // Depending on how jwt verification error is mapped
      expect([401, 403]).toContain(response.status);
    });

    it('should allow request to proceed with valid token', async () => {
      const user = await createTestUser(prisma);
      const token = await generateTestAccessToken(user);

      const response = await request(app)
        .get('/api/v1/identity/me')
        .set('Authorization', `Bearer ${token}`);
        
      // If it reaches the controller, it shouldn't be 401
      expect(response.status).not.toBe(401);
      // Ideally it should be 200, assuming /api/v1/identity/me is fully implemented
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.userId).toBe(user.getId());
    });
  });
});
