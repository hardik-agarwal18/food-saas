import { Redis } from 'ioredis';
import { env } from '../../config/env.config.js';

/**
 * Configuration for the shared Redis connection.
 *
 * `lazyConnect: true` means Redis does not connect immediately
 * when this module is imported. The application explicitly
 * connects during its startup process.
 *
 * `maxRetriesPerRequest: null` disables ioredis request-level
 * retry limits. This is commonly used when Redis commands must
 * remain pending while the connection is being recovered.
 *
 * `enableReadyCheck: true` makes ioredis wait until Redis is
 * ready before considering the connection usable.
 */
export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  lazyConnect: true,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
};

/**
 * Shared Redis client used by the application.
 *
 * A single client is exported so that different services
 * reuse the same connection instead of creating separate
 * Redis clients.
 */
export const redis = new Redis(redisConnection);

export default redis;
