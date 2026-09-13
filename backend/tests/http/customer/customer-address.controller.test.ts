import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app/app.js';
import { prisma } from '../../../src/infrastructure/database/prisma.js';
import { createTestUser } from '../../factories/user.factory.js';
import { buildTestCustomer } from '../../factories/customer.factory.js';
import { generateTestAccessToken } from '../../helpers/auth.helper.js';

describe('Customer Address HTTP Controllers', () => {
  let customerToken: string;
  let customerId: string;
  let addressId: string;

  beforeEach(async () => {
    // 1. Create User
    const user = await createTestUser(prisma);

    // 2. Create Customer
    const customer = buildTestCustomer({
      userId: user.getId(),
      firstName: 'Address',
      lastName: 'Tester',
    });

    await prisma.customer.create({
      data: {
        id: customer.getId(),
        userId: customer.getUserId(),
        firstName: customer.getFirstName().getValue(),
        lastName: customer.getLastName().getValue(),
        phone: customer.getPhone().getValue(),
        preferences: customer.getPreferences().toPrimitives(),
      },
    });

    customerId = customer.getId();

    // 3. Create an initial address for update/delete tests
    const address = await prisma.customerAddress.create({
      data: {
        customerId: customerId,
        label: 'Initial',
        streetAddress: '123 Test St',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        country: 'US',
        isDefault: false
      }
    });
    addressId = address.id;

    // 4. Generate Token
    customerToken = await generateTestAccessToken(user);
  });

  describe('POST /customers/me/addresses', () => {
    it('should create a new customer address', async () => {
      const payload = {
        label: 'Home',
        streetAddress: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      };

      const response = await request(app)
        .post('/api/v1/customers/me/addresses')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(payload);

      if (response.status !== 201) console.log(response.body); expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.label).toBe('Home');
      expect(response.body.data.city).toBe('Metropolis');
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/v1/customers/me/addresses')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ label: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /customers/me/addresses', () => {
    it('should list all customer addresses', async () => {
      const response = await request(app)
        .get('/api/v1/customers/me/addresses')
        .set('Authorization', `Bearer ${customerToken}`);

      if (response.status !== 200) console.log(response.body); expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      // It should contain the initial address we created in beforeEach
      expect(response.body.data.some((a: any) => a.id === addressId)).toBe(true);
    });
  });

  describe('PATCH /customers/me/addresses/:addressId', () => {
    it('should update the customer address', async () => {
      const response = await request(app)
        .patch(`/api/v1/customers/me/addresses/${addressId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ label: 'Work', zipCode: '10002' });

      if (response.status !== 200) console.log(response.body); expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.label).toBe('Work');
      expect(response.body.data.zipCode).toBe('10002');
    });
  });

  describe('POST /customers/me/addresses/:addressId/default', () => {
    it('should set the address as default', async () => {
      const response = await request(app)
        .post(`/api/v1/customers/me/addresses/${addressId}/default`)
        .set('Authorization', `Bearer ${customerToken}`);

      if (response.status !== 200) console.log(response.body); expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const verifyResp = await request(app)
        .get('/api/v1/customers/me/addresses')
        .set('Authorization', `Bearer ${customerToken}`);

      const address = verifyResp.body.data.find((a: any) => a.id === addressId);
      expect(address.isDefault).toBe(true);
    });
  });

  describe('DELETE /customers/me/addresses/:addressId', () => {
    it('should delete the address', async () => {
      const response = await request(app)
        .delete(`/api/v1/customers/me/addresses/${addressId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(204);

      const verifyResp = await request(app)
        .get('/api/v1/customers/me/addresses')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(verifyResp.body.data.find((a: any) => a.id === addressId)).toBeUndefined();
    });
  });
});
