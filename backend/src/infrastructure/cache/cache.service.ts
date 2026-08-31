import { redis } from './redis.js';
import { logger } from '../../config/logger.js';
import { cacheSerializer } from './cache.serializer.js';
import { cacheMetrics } from './cache.metrics.js';
import { CacheOperation as cacheOperations } from './cache.enum.js';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const startedAt = performance.now();

    try {
      const value = await redis.get(key);

      if (value === null) {
        cacheMetrics.recordMiss(key);
        return null;
      }

      cacheMetrics.recordHit(key);

      return cacheSerializer.deserialize<T>(value);
    } catch (error) {
      cacheMetrics.recordFailure(cacheOperations.GET, key, error);

      logger.error({ error, key }, 'Failed to get value from cache for key');
      return null;
    } finally {
      cacheMetrics.recordLatency(cacheOperations.GET, key, performance.now() - startedAt);
    }
  }

  async set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
    const startedAt = performance.now();

    try {
      const serializedValue = cacheSerializer.serialize(value);

      if (ttlInSeconds !== undefined && ttlInSeconds > 0) {
        await redis.set(key, serializedValue, 'EX', ttlInSeconds);
      } else {
        await redis.set(key, serializedValue);
      }

      cacheMetrics.recordSet(key);
    } catch (error) {
      cacheMetrics.recordFailure(cacheOperations.SET, key, error);

      logger.error({ error, key }, 'Failed to set value in cache for key');
    } finally {
      cacheMetrics.recordLatency(cacheOperations.SET, key, performance.now() - startedAt);
    }
  }

  async delete(key: string): Promise<void> {
    const startedAt = performance.now();

    try {
      await redis.del(key);

      cacheMetrics.recordDelete(key);
    } catch (error) {
      cacheMetrics.recordFailure(cacheOperations.DELETE, key, error);

      logger.error({ error, key }, 'Failed to delete value from cache for key');
    } finally {
      cacheMetrics.recordLatency(cacheOperations.DELETE, key, performance.now() - startedAt);
    }
  }

  async exists(key: string): Promise<boolean> {
    const startedAt = performance.now();

    try {
      if ((await redis.exists(key)) === 1) {
        cacheMetrics.recordExists(key);
        return true;
      }

      return false;
    } catch (error) {
      cacheMetrics.recordFailure(cacheOperations.EXISTS, key, error);

      logger.error({ error, key }, 'Failed to check if key exists in cache');
      return false;
    } finally {
      cacheMetrics.recordLatency(cacheOperations.EXISTS, key, performance.now() - startedAt);
    }
  }

  async expire(key: string, ttlInSeconds: number): Promise<void> {
    const startedAt = performance.now();

    try {
      await redis.expire(key, ttlInSeconds);

      cacheMetrics.recordExpire(key, ttlInSeconds);
    } catch (error) {
      cacheMetrics.recordFailure(cacheOperations.EXPIRE, key, error);

      logger.error({ error, key }, 'Failed to update cache expiration for key');
    } finally {
      cacheMetrics.recordLatency(cacheOperations.EXPIRE, key, performance.now() - startedAt);
    }
  }

  async increment(key: string): Promise<number> {
    const startedAt = performance.now();

    try {
      const res = await redis.incr(key);
      cacheMetrics.recordIncrement(key);

      return res;
    } catch (error) {
      cacheMetrics.recordFailure(cacheOperations.INCREMENT, key, error);

      logger.error({ error, key }, 'Failed to increment value in cache for key');
      return 0;
    } finally {
      cacheMetrics.recordLatency(cacheOperations.INCREMENT, key, performance.now() - startedAt);
    }
  }
}

export const cacheService = new CacheService();
