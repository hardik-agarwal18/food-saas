import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app/app.js';

describe('Identity Controllers (HTTP)', () => {
  const generateEmail = () => `test-${Date.now()}@example.com`;

  describe('POST /api/v1/identity/register', () => {
    it('should successfully register a new user', async () => {
      const email = generateEmail();
      const response = await request(app)
        .post('/api/v1/identity/register')
        .send({
          email,
          password: 'StrongPassword123!',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        });
        
      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user.email).toBe(email);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/identity/register')
        .send({
          email: generateEmail(),
        });
        
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 409 if email already exists', async () => {
      const email = generateEmail();
      const payload = {
        email,
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };
      
      // Register first time
      await request(app).post('/api/v1/identity/register').send(payload);
      
      // Register second time
      const response = await request(app).post('/api/v1/identity/register').send(payload);
      
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
    });
  });

  describe('POST /api/v1/identity/login', () => {
    it('should login and return tokens for valid credentials', async () => {
      const email = generateEmail();
      const password = 'StrongPassword123!';
      
      // Register user first
      await request(app)
        .post('/api/v1/identity/register')
        .send({
          email,
          password,
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '0987654321',
        });
        
      const response = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email,
          password,
        });
        
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword!',
        });
        
      expect(response.status).toBe(401);
    });
  });
});
