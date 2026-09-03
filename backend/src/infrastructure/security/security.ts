import type { Express } from 'express';
import { env } from '../../config/env.config.js';
import { helmetMiddleware } from './helmet.js';
import { bodyParserMiddleware } from './body-parser.js';
import { cookieParserMiddleware } from './cookies.js';
import { corsMiddleware } from './cors.js';
import { globalRateLimiter } from './rate-limit.js';
import { timeoutMiddleware, haltOnTimeout } from './timeout.js';

/**
 * Registers security and request-protection middleware.
 *
 * This function keeps application bootstrap code clean.
 * Instead of registering every middleware directly in app.ts,
 * app.ts only needs to call registerSecurity(app).
 *
 * The order is important because middleware runs in the
 * order in which it is registered.
 */
export const registerSecurity = (app: Express): void => {
  /**
   * Configures how Express determines the original client IP
   * when the application is behind a reverse proxy or load balancer.
   */
  app.set('trust proxy', env.TRUST_PROXY);

  /**
   * Adds security-related response headers.
   */
  app.use(helmetMiddleware);

  /**
   * Parses JSON and URL-encoded request bodies.
   */
  app.use(bodyParserMiddleware);

  /**
   * Makes request cookies available through req.cookies.
   */
  app.use(cookieParserMiddleware);

  /**
   * Applies cross-origin access rules.
   */
  app.use(corsMiddleware);

  /**
   * Applies the global request-rate limit.
   */
  app.use(globalRateLimiter);

  /**
   * Marks requests that exceed the configured timeout.
   */
  app.use(timeoutMiddleware);

  /**
   * Prevents timed-out requests from continuing through
   * later middleware and route handlers.
   *
   * Register this here if it is not registered elsewhere.
   */
  app.use(haltOnTimeout);
};
