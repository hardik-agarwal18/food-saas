import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app/app.js';
import { prisma } from '../../../src/infrastructure/database/prisma.js';
import { createTestUser } from '../../factories/user.factory.js';
import { buildTestCustomer } from '../../factories/customer.factory.js';
import { generateTestAccessToken } from '../../helpers/auth.helper.js';

describe('Customer Controllers (HTTP)', () => {
  describe('GET /api/v1/customer/me', () => {
    it('should return customer profile', async () => {
      const user = await createTestUser(prisma);
      const token = await generateTestAccessToken(user);

      const customer = buildTestCustomer({
        userId: user.getId(),
        firstName: 'Alice',
        lastName: 'Smith',
      });

      await prisma.customer.create({
        data: {
          id: customer.getId(),
          userId: customer.getUserId(),
          firstName: customer.getFirstName().getValue(),
          lastName: customer.getLastName().getValue(),
          phone: customer.getPhone().getValue(),
          preferences: {
            language: 'en',
            notifications: { push: true, sms: false, email: true },
            marketing: { enabled: true },
          },
        },
      });

      const response = await request(app)
        .get('/api/v1/customer/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.customerId).toBe(customer.getId());
      expect(response.body.data.firstName).toBe('Alice');
      expect(response.body.data.lastName).toBe('Smith');
    });

    it('should return 404 if profile does not exist', async () => {
      const user = await createTestUser(prisma);
      const token = await generateTestAccessToken(user);

      const response = await request(app)
        .get('/api/v1/customer/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('CUSTOMER_NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/customer/update-profile', () => {
    it('should update customer profile', async () => {
      const user = await createTestUser(prisma);
      const token = await generateTestAccessToken(user);

      const customer = buildTestCustomer({
        userId: user.getId(),
        firstName: 'Alice',
        lastName: 'Smith',
      });

      await prisma.customer.create({
        data: {
          id: customer.getId(),
          userId: customer.getUserId(),
          firstName: customer.getFirstName().getValue(),
          lastName: customer.getLastName().getValue(),
          phone: customer.getPhone().getValue(),
          preferences: {
            language: 'en',
            notifications: { push: true, sms: false, email: true },
            marketing: { enabled: true },
          },
        },
      });

      const response = await request(app)
        .patch('/api/v1/customer/update-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Alicia',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('Alicia');
      expect(response.body.data.lastName).toBe('Smith'); // Unchanged
    });
  });

  describe('PATCH /api/v1/customer/me/update-preferences', () => {
    it('should update customer preferences', async () => {
      const user = await createTestUser(prisma);
      const token = await generateTestAccessToken(user);

      const customer = buildTestCustomer({
        userId: user.getId(),
        firstName: 'Alice',
        lastName: 'Smith',
      });

      await prisma.customer.create({
        data: {
          id: customer.getId(),
          userId: customer.getUserId(),
          firstName: customer.getFirstName().getValue(),
          lastName: customer.getLastName().getValue(),
          phone: customer.getPhone().getValue(),
          preferences: {
            language: 'en',
            notifications: { push: true, sms: false, email: true },
            marketing: { enabled: true },
          },
        },
      });

      const response = await request(app)
        .patch('/api/v1/customer/me/update-preferences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: 'es',
        });

      expect(response.status).toBe(200);

      const profileResponse = await request(app)
        .get('/api/v1/customer/me')
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.preferences.language).toBe('es');
      expect(profileResponse.body.data.preferences.notifications.push).toBe(true); // Unchanged
    });
  });
});
