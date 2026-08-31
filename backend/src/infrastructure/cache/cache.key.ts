import { env } from '../../config/env.config.js';

const CACHE_PREFIX = env.CACHE_PREFIX;
const CACHE_VERSION = env.CACHE_VERSION;

const generateCacheKey = (...segments: string[]) => {
  return `${CACHE_PREFIX}:${CACHE_VERSION}:${segments.join(':')}`;
};

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
