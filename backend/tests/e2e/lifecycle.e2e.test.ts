import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app/app.js';
import {
  connectTestDatabase,
  disconnectTestDatabase,
  cleanTestDatabase,
  getPrismaClient,
} from '../helpers/test.database.js';
import { container } from 'tsyringe';
import { IdentityTokens } from '../../src/modules/identity/infrastructure/persistence/tokens/identity.tokens.js';
import { vi } from 'vitest';

const prisma = getPrismaClient();

describe('Full Lifecycle E2E Test', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    vi.clearAllMocks();
  });

  it('should successfully complete the core user lifecycle: Register -> Verify -> Login -> Fetch -> Update -> Refresh -> Logout -> Token Rejection', async () => {
    const testUser = {
      email: 'e2e.test@example.com',
      password: 'StrongPassword123!',
      firstName: 'E2E',
      lastName: 'User',
      phone: '+1234567890',
    };

    const emailQueue = container.resolve<any>(IdentityTokens.EmailJobQueue);
    const enqueueSpy = vi.spyOn(emailQueue, 'enqueueVerificationEmail');

    // 1. Register User
    const registerResponse = await request(app).post('/api/v1/identity/register').send(testUser);

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.data.user.email).toBe(testUser.email);
    expect(registerResponse.body.data.user.emailVerified).toBe(false);

    // Get the created user ID
    const userId = registerResponse.body.data.user.id;
    expect(userId).toBeDefined();

    // 2. Extract Verification Token via Spying on Email Queue
    expect(enqueueSpy).toHaveBeenCalledTimes(1);
    const jobCall = enqueueSpy.mock.calls[0][0];
    const url = new URL(jobCall.verificationUrl);
    const verificationToken = url.pathname.split('/').pop() as string;
    
    expect(verificationToken).toBeDefined();

    // 3. Login
    const loginResponse = await request(app).post('/api/v1/identity/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.accessToken).toBeDefined();
    expect(loginResponse.body.data.refreshToken).toBeDefined();
    expect(loginResponse.body.data.user.emailVerified).toBe(false); // Should be false initially

    let accessToken = loginResponse.body.data.accessToken;
    const initialRefreshToken = loginResponse.body.data.refreshToken;

    // 4. Verify Email
    const verifyResponse = await request(app)
      .get(`/api/v1/identity/verify-email/${verificationToken}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(verifyResponse.status).toBe(200);

    // Verify email is now verified by fetching profile or user
    const userMeResponse = await request(app)
      .get('/api/v1/identity/me')
      .set('Authorization', `Bearer ${accessToken}`);
      
    expect(userMeResponse.status).toBe(200);
    expect(userMeResponse.body.data.isEmailVerified).toBe(true);

    // 5. Fetch Customer Profile
    const fetchProfileResponse = await request(app)
      .get('/api/v1/customer/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(fetchProfileResponse.status).toBe(200);
    expect(fetchProfileResponse.body.data.firstName).toBe(testUser.firstName.toLowerCase());
    expect(fetchProfileResponse.body.data.lastName).toBe(testUser.lastName.toLowerCase());
    expect(fetchProfileResponse.body.data.phone).toBe(testUser.phone);

    // 6. Update Customer Profile
    const updateProfileResponse = await request(app)
      .patch('/api/v1/customer/update-profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'UpdatedE2E',
      });

    expect(updateProfileResponse.status).toBe(200);
    expect(updateProfileResponse.body.data.firstName).toBe('UpdatedE2E');
    expect(updateProfileResponse.body.data.lastName).toBe(testUser.lastName.toLowerCase()); // Unchanged

    // 7. Refresh Token
    const refreshResponse = await request(app)
      .post('/api/v1/identity/refresh')
      .set('Cookie', `refreshToken=${initialRefreshToken}`);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.accessToken).toBeDefined();
    expect(refreshResponse.body.data.refreshToken).toBeDefined();
    expect(refreshResponse.body.data.refreshToken).not.toBe(initialRefreshToken); // Should be a new token

    accessToken = refreshResponse.body.data.accessToken;
    const newRefreshToken = refreshResponse.body.data.refreshToken;

    // 8. Logout
    const logoutResponse = await request(app)
      .post('/api/v1/identity/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', `refreshToken=${newRefreshToken}`);

    expect(logoutResponse.status).toBe(200);

    // 9. Token Rejection Flow (Ensure old token no longer works)
    // The access token might still be valid since we don't have a denylist, but the refresh token shouldn't work.
    const rejectRefreshResponse = await request(app)
      .post('/api/v1/identity/refresh')
      .set('Cookie', `refreshToken=${newRefreshToken}`);

    expect(rejectRefreshResponse.status).toBe(401);
  });
});
