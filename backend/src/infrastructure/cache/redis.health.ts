import { logger } from '../../config/logger.js';
import redis from './redis.js';

export const checkRedisHealth = async () => {
  try {
    const startedAt = process.hrtime.bigint();

    await redis.ping();

    const latency = Number(process.hrtime.bigint() - startedAt) / 1_000_000; // Convert to milliseconds

    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    logger.error({ error }, 'Redis health check failed');
    return { status: 'unhealthy' };
  }
};
