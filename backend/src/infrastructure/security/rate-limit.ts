import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { RateLimitPolicies } from '../../config/rate-limit.config.js';

/**
 * Shared options for rate limiters.
 *
 * These options are reused by individual rate limiters
 * so that their response-header behavior remains consistent.
 */
const baseOptions = {
  /**
   * Sends modern rate-limit headers.
   */
  standardHeaders: true,

  /**
   * Disables older X-RateLimit-* headers.
   */
  legacyHeaders: false,

  /**
   * Failed requests still count toward the rate limit.
   *
   * This prevents clients from repeatedly sending failing
   * requests without consuming their quota.
   */
  skipFailedRequests: false,
} as const;

/**
 * Global rate limiter applied to the entire application.
 *
 * The window length and maximum number of requests are
 * controlled through environment configuration.
 */
export const globalRateLimiter: RateLimitRequestHandler = rateLimit({
  ...baseOptions,

  /**
   * Converts the configured window from minutes to milliseconds.
   */
  windowMs: RateLimitPolicies.Global.windowMs,

  /**
   * Maximum requests allowed during the configured window.
   */
  max: RateLimitPolicies.Global.max,

  /**
   * Structured response returned when the limit is exceeded.
   */
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEED',
      message: 'Too many requests. Please try again later',
    },
  },
});
