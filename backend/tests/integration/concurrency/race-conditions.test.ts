import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app/app.js';
import { redisConnection } from '../../../src/config/redis.js';
import { Redis } from 'ioredis';
import { prisma } from '../../../src/infrastructure/database/prisma.js';

describe('Concurrency and Race-Condition Tests', () => {
  let redisClient: Redis;

  beforeAll(() => {
    redisClient = new Redis(redisConnection);
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  describe('Registration Concurrency', () => {
    it('should prevent multiple users from registering with the same email concurrently', async () => {
      const email = `concurrent-register-${Date.now()}@example.com`;
      const userData = {
        email,
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Concurrent',
        phone: '1234567890',
      };

      // Fire 5 registration requests simultaneously
      const requests = Array.from({ length: 5 }).map((_, i) =>
        request(app)
          .post('/api/v1/identity/register')
          .set('X-Forwarded-For', `192.168.1.${i + 1}`)
          .send(userData),
      );

      const responses = await Promise.all(requests);

      // Only exactly ONE request should succeed with 201
      const successResponses = responses.filter((r) => r.status === 201);
      expect(successResponses.length).toBe(1);

      // The others should fail, likely with 409 Conflict (User already exists)
      const conflictResponses = responses.filter((r) => r.status === 409);
      expect(conflictResponses.length).toBe(4);
    });
  });

  describe('Refresh Token Concurrency', () => {
    it('should handle concurrent token refreshes gracefully (no crashes)', async () => {
      // 1. Register and login a user to get a valid refresh token
      const email = `concurrent-refresh-${Date.now()}@example.com`;
      const password = 'StrongPassword123!';
      const registerRes = await request(app)
        .post('/api/v1/identity/register')
        .set('X-Forwarded-For', '192.168.2.1')
        .send({
          email,
          password,
          firstName: 'Alice',
          lastName: 'Refresh',
          phone: '1234567890',
        });

      if (registerRes.status !== 201) {
        throw new Error(`Failed to register: ${registerRes.status} ${JSON.stringify(registerRes.body)}`);
      }

      // Mark user as verified directly in DB to bypass token requirement
      await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      });

      const loginResponse = await request(app)
        .post('/api/v1/identity/login')
        .set('X-Forwarded-For', '192.168.2.1')
        .send({
          email,
          password,
        });

      // Assuming login succeeds and returns cookies
      const cookies = loginResponse.headers['set-cookie'] || [];
      const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));

      if (!refreshTokenCookie) {
        throw new Error('Failed to retrieve refresh token');
      }

      // Fire 5 refresh token requests simultaneously
      const requests = Array.from({ length: 5 }).map((_, i) =>
        request(app)
          .post('/api/v1/identity/refresh')
          .set('X-Forwarded-For', `192.168.2.${i + 2}`)
          .set('Cookie', cookies),
      );

      const responses = await Promise.all(requests);

      // Since refresh tokens are rotated, only the FIRST one to hit the DB might succeed,
      // and subsequent ones might either be rejected (401) or handled by token reuse detection.
      // But they should NOT crash the server (500).
      const successResponses = responses.filter((r) => r.status === 200);
      const unauthorizedResponses = responses.filter((r) => r.status === 401 || r.status === 403);
      const serverErrors = responses.filter((r) => r.status >= 500);

      expect(serverErrors.length).toBe(0);
      // At most 1 should succeed due to rotation
      expect(successResponses.length).toBeLessThanOrEqual(1);
    });
  });
});
