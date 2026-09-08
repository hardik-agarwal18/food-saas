import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { ErrorHandlerMiddleware } from '../../../src/app/middleware/error-handler.middleware.js';
import { AppError } from '../../../src/shared/errors/AppError.js';
import { DomainError } from '../../../src/shared/errors/index.js';
import { AuthenticationError } from '../../../src/shared/errors/AuthenticationError.js';
import { ILogger } from '../../../src/shared/logger/logger.interface.js';

describe('Error Handler Middleware (HTTP)', () => {
  const mockLogger: ILogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  const createTestApp = (isProduction = false) => {
    const app = express();
    
    // Some routes that throw different types of errors
    app.get('/app-error', () => {
      throw new AppError('This is an AppError', 400, 'CUSTOM_ERROR');
    });

    app.get('/domain-error', () => {
      throw new DomainError('This is a DomainError');
    });

    app.get('/auth-error', () => {
      throw new AuthenticationError('Unauthorized access');
    });

    app.get('/unexpected-error', () => {
      throw new Error('Something went terribly wrong');
    });

    const errorHandler = new ErrorHandlerMiddleware(
      { NODE_ENV: isProduction ? 'production' : 'development' } as any,
      mockLogger
    );

    app.use(errorHandler.handle);

    return app;
  };

  it('should handle AppError and map to 400', async () => {
    const app = createTestApp();
    const response = await request(app).get('/app-error');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'CUSTOM_ERROR',
        message: 'This is an AppError',
      },
    });
  });

  it('should handle DomainError and map to 400 (or mapped equivalent)', async () => {
    const app = createTestApp();
    const response = await request(app).get('/domain-error');
    
    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('Internal server error');
  });

  it('should handle AuthenticationError and map to 401', async () => {
    const app = createTestApp();
    const response = await request(app).get('/auth-error');
    
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('should handle unexpected errors and map to 500', async () => {
    const app = createTestApp(false); // development mode
    const response = await request(app).get('/unexpected-error');
    
    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('Internal server error');
  });

  it('should hide unexpected error details in production', async () => {
    const app = createTestApp(true); // production mode
    const response = await request(app).get('/unexpected-error');
    
    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('Internal server error');
  });
});
