import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app/app.js';
import { prisma } from '../../../src/infrastructure/database/prisma.js';
import { createTestUser } from '../../factories/user.factory.js';
import { generateTestAccessToken } from '../../helpers/auth.helper.js';

describe('Menu Controllers (HTTP)', () => {
  const setupRestaurant = async () => {
    const user = await createTestUser(prisma, { roles: ['RESTAURANT_OWNER'] });
    const token = await generateTestAccessToken(user);

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: user.getId(),
        name: 'Test Restaurant',
        description: 'Test Description',
        phoneNumber: '1234567890',
        email: 'test@restaurant.com',
        streetAddress: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        status: 'ACTIVE',
      },
    });

    return { user, token, restaurantId: restaurant.id };
  };

  describe('Menu Categories', () => {
    it('should create a menu category', async () => {
      const { token, restaurantId } = await setupRestaurant();

      const response = await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/categories`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Appetizers',
          description: 'Start your meal right',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Appetizers');
      expect(response.body.data.id).toBeDefined();
    });

    it('should list menu categories', async () => {
      const { token, restaurantId } = await setupRestaurant();

      await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/categories`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Drinks' });

      const response = await request(app)
        .get(`/api/v1/restaurants/${restaurantId}/menu/categories`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].name).toBe('Drinks');
    });
  });

  describe('Menu Items', () => {
    it('should create a menu item', async () => {
      const { token, restaurantId } = await setupRestaurant();

      const categoryResponse = await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/categories`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Mains' });
      
      const categoryId = categoryResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryId,
          name: 'Burger',
          description: 'A delicious burger',
          price: 15.99,
          currency: 'USD',
          isAvailable: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Burger');
      expect(response.body.data.price).toBe(15.99);
    });

    it('should list menu items', async () => {
      const { token, restaurantId } = await setupRestaurant();

      const categoryResponse = await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/categories`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Desserts' });
      
      const categoryId = categoryResponse.body.data.id;

      await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryId,
          name: 'Ice Cream',
          description: 'Vanilla ice cream',
          price: 5.99,
          currency: 'USD',
          isAvailable: true,
        });

      const response = await request(app)
        .get(`/api/v1/restaurants/${restaurantId}/menu/items`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].name).toBe('Ice Cream');
    });
  });

  describe('Menu Modifier Groups and Items', () => {
    it('should create a modifier group', async () => {
      const { token, restaurantId } = await setupRestaurant();

      const response = await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/modifier-groups`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Burger Add-ons',
          description: 'Extras for your burger',
          minSelections: 0,
          maxSelections: 5,
          isRequired: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Burger Add-ons');
    });

    it('should create a modifier item', async () => {
      const { token, restaurantId } = await setupRestaurant();

      const groupResponse = await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/modifier-groups`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Burger Add-ons',
          minSelections: 0,
          maxSelections: 5,
          isRequired: false,
        });
      
      const groupId = groupResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/restaurants/${restaurantId}/menu/modifier-groups/${groupId}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Bacon',
          priceAdjustment: 2.00,
          isAvailable: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Bacon');
      expect(response.body.data.priceAdjustment).toBe(2);
    });
  });
});
