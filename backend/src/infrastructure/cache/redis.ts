import { Redis } from 'ioredis';
import { env } from '../../config/env.config.js';
import { logger } from '../../config/logger.js';

export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  lazyConnect: true,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
};

export const redis = new Redis(redisConnection);

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error({ status: false, message: 'Redis connection error:', error });
});

export default redis;
