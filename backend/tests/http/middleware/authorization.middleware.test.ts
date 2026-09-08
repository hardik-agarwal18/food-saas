import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app/app.js';
import { createTestUser } from '../../factories/user.factory.js';
import { generateTestAccessToken } from '../../helpers/auth.helper.js';
import { prisma } from '../../../src/infrastructure/database/prisma.js';
import { Role } from '../../../src/modules/identity/domain/enums/index.js';

describe('Authorization Middleware (HTTP)', () => {

  describe('GET /api/v1/customer/me (Requires CUSTOMER_PROFILE_READ)', () => {
    it('should return 403 if user has the wrong role', async () => {
      // Assuming ADMIN role might not have explicit CUSTOMER_PROFILE_READ, 
      // or we can test with a totally unprivileged role if one exists.
      // Let's create a user with NO roles to guarantee failure.
      const user = await createTestUser(prisma, { roles: [] });
      const token = await generateTestAccessToken(user);

      const response = await request(app)
        .get('/api/v1/customer/me')
        .set('Authorization', `Bearer ${token}`);
        
      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should allow request if user has the allowed role (CUSTOMER)', async () => {
      const user = await createTestUser(prisma, { roles: [Role.CUSTOMER] });
      const token = await generateTestAccessToken(user);

      const response = await request(app)
        .get('/api/v1/customer/me')
        .set('Authorization', `Bearer ${token}`);
        
      // Request proceeds. If customer profile doesn't exist, it might return 404
      // but it won't return 403 (Forbidden).
      expect(response.status).not.toBe(403);
    });

    it('should fail with 401 if authentication is completely missing before authorization', async () => {
      const response = await request(app).get('/api/v1/customer/me');
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });
});
