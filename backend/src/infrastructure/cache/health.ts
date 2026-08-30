import redis from './redis.js';

export const checkRedisHealth = async () => {
  try {
    const pong = await redis.ping();

    return {
      status: pong === 'PONG' ? 'healthy' : 'unhealthy',
    };
  } catch {
    return { status: 'unhealthy' };
  }
};
