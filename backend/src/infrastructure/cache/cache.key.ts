import { env } from '../../config/env.config.js';

/**
 * Prefix shared by all cache keys.
 *
 * This can separate keys belonging to different applications,
 * environments, or deployments.
 */
const CACHE_PREFIX = env.CACHE_PREFIX;

/**
 * Version of the cache-key format.
 *
 * Incrementing the version allows the application to invalidate
 * old keys without manually deleting every existing key.
 */
const CACHE_VERSION = env.CACHE_VERSION;

/**
 * Builds a consistent cache key.
 *
 * Example:
 *
 * generateCacheKey('identity', 'user', '123')
 *
 * becomes conceptually:
 *
 * prefix:version:identity:user:123
 */
const generateCacheKey = (...segments: string[]) => {
  return `${CACHE_PREFIX}:${CACHE_VERSION}:${segments.join(':')}`;
};

/**
 * Centralized cache-key builders.
 *
 * Keeping key creation in one place prevents different parts
 * of the application from using inconsistent key formats.
 */
export const cacheKeys = {
  identity: {
    user: (userId: string) => generateCacheKey('identity', 'user', userId),
  },

  session: (sessionId: string) => generateCacheKey('identity', 'session', sessionId),

  customer: {
    profile: (customerId: string) => generateCacheKey('customer', 'profile', customerId),

    address: (customerId: string) => generateCacheKey('customer', 'address', customerId),
  },

  restaurant: {
    restaurant: (restaurantId: string) =>
      generateCacheKey('restaurant', 'restaurant', restaurantId),

    menu: (restaurantId: string) => generateCacheKey('restaurant', 'menu', restaurantId),
  },

  ordering: {
    order: (orderId: string) => generateCacheKey('ordering', 'order', orderId),
  },

  driver: {
    driver: (driverId: string) => generateCacheKey('driver', 'driver', driverId),
  },
} as const;
