import { redis } from './redis.js';
import { logger } from '../../config/logger.js';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error({ error, key }, 'Failed to get value from cache for key');
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      if (ttlInSeconds) {
        await redis.set(key, serializedValue, 'EX', ttlInSeconds);
        return;
      }

      await redis.set(key, serializedValue);
    } catch (error) {
      logger.error({ error, key }, 'Failed to set value in cache for key');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Failed to delete value from cache for key');
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await redis.exists(key)) === 1;
    } catch (error) {
      logger.error({ error, key }, 'Failed to check if key exists in cache');

      return false;
    }
  }

  async expire<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
    try {
      await redis.expire(key, ttlInSeconds || 0);
    } catch (error) {
      logger.error({ error, key }, 'Failed to update cache expiration for key');
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error({ error, key }, 'Failed to increment value in cache for key');
      return 0;
    }
  }
}

export const cacheService = new CacheService();
