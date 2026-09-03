import type { CorsOptions } from 'cors';
import { env } from '../../config/env.config.js';
import cors from 'cors';

/**
 * CORS configuration for browser-based clients.
 *
 * Only the configured frontend origin is allowed.
 *
 * `credentials: true` allows browsers to send credentials,
 * such as cookies, with cross-origin requests.
 */
export const corsOptions: CorsOptions = {
  /**
   * The allowed frontend origin comes from environment
   * configuration rather than being hardcoded.
   */
  origin: env.FRONTEND_URL,

  /**
   * Allows cookies and other credentials to be sent.
   */
  credentials: true,

  /**
   * HTTP methods allowed for cross-origin requests.
   */
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

/**
 * Express middleware generated from the CORS configuration.
 */
export const corsMiddleware = cors(corsOptions);
