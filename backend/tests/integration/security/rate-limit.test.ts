import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app/app.js';
import { redisConnection } from '../../../src/config/redis.js';
import { RateLimitPolicies } from '../../../src/config/rate-limit.config.js';
import { Redis } from 'ioredis';

describe('Rate Limiting Integration Tests', () => {
  let redisClient: Redis;

  beforeAll(() => {
    // We instantiate our own Redis client for test cleanup using the exported config
    redisClient = new Redis(redisConnection);
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  beforeEach(async () => {
    // Clear all rate limit keys to ensure a clean slate before each test
    const keys = await redisClient.keys('*identity-*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  });

  const generateRandomIp = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(
      Math.random() * 255,
    )}.${Math.floor(Math.random() * 255)}`;
  };

  it('should rate limit repeated failed login attempts', async () => {
    const ip = generateRandomIp();
    const limit = RateLimitPolicies.Login.max;

    // Send 'limit' number of failed requests
    for (let i = 0; i < limit; i++) {
      const response = await request(app)
        .post('/api/v1/identity/login')
        .set('X-Forwarded-For', ip)
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        });

      // Assert that these requests are rejected due to invalid credentials, not rate limit yet
      expect(response.status).toBe(401);
    }

    // The next request should trigger the rate limit
    const rateLimitedResponse = await request(app)
      .post('/api/v1/identity/login')
      .set('X-Forwarded-For', ip)
      .send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      });

    expect(rateLimitedResponse.status).toBe(429);
    expect(rateLimitedResponse.body.success).toBe(false);
    expect(rateLimitedResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should rate limit repeated failed forgot-password attempts', async () => {
    const ip = generateRandomIp();
    const limit = RateLimitPolicies.ForgotPassword.max;

    // Send 'limit' number of failed requests
    for (let i = 0; i < limit; i++) {
      const response = await request(app)
        .post('/api/v1/identity/forgot-password')
        .set('X-Forwarded-For', ip)
        .send({
          // Missing email intentionally to trigger a 400 Bad Request which is a failed request
        });

      expect(response.status).toBe(400);
    }

    // The next request should trigger the rate limit
    const rateLimitedResponse = await request(app)
      .post('/api/v1/identity/forgot-password')
      .set('X-Forwarded-For', ip)
      .send({});

    expect(rateLimitedResponse.status).toBe(429);
    expect(rateLimitedResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should not rate limit successful requests due to skipSuccessfulRequests', async () => {
    const ip = generateRandomIp();
    const limit = RateLimitPolicies.Register.max;

    // Send 'limit' + 2 successful requests
    for (let i = 0; i < limit + 2; i++) {
      const email = `test-success-${Date.now()}-${i}@example.com`;
      const response = await request(app)
        .post('/api/v1/identity/register')
        .set('X-Forwarded-For', ip)
        .send({
          email,
          password: 'StrongPassword123!',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        });

      // Ensure the request was successful
      expect(response.status).toBe(201);
    }
  });

  it('should allow requests from a different IP even if one is rate limited', async () => {
    const limitedIp = generateRandomIp();
    const newIp = generateRandomIp();
    const limit = RateLimitPolicies.Login.max;

    // Rate limit the first IP
    for (let i = 0; i < limit; i++) {
      await request(app)
        .post('/api/v1/identity/login')
        .set('X-Forwarded-For', limitedIp)
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        });
    }

    // Verify it is rate limited
    const rateLimitedResponse = await request(app)
      .post('/api/v1/identity/login')
      .set('X-Forwarded-For', limitedIp)
      .send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      });
    expect(rateLimitedResponse.status).toBe(429);

    // Make a request from a new IP, should NOT be rate limited
    const newIpResponse = await request(app)
      .post('/api/v1/identity/login')
      .set('X-Forwarded-For', newIp)
      .send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      });

    // Should be 401 Unauthorized because the credentials are bad, but NOT 429
    expect(newIpResponse.status).toBe(401);
  });
});
