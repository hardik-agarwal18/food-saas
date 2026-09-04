import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/tokens/infrastructure.tokens.js';
import { cacheSerializer } from './cache.serializer.js';
import { CacheMetrics } from './cache.metrics.js';
import { CacheOperation } from './cache.enum.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';
import type { Redis } from 'ioredis';

/**
 * Provides application-level cache operations.
 *
 * Responsibilities:
 * - Read values from Redis.
 * - Serialize values before writing.
 * - Deserialize values after reading.
 * - Apply optional TTL values.
 * - Record cache metrics.
 * - Log failures.
 * - Return safe fallback values when cache operations fail.
 *
 * The cache is treated as an optimization layer rather than
 * the primary source of truth.
 */
@injectable()
export class CacheService {
  constructor(
    /**
     * Shared Redis client.
     */
    @inject(InfrastructureTokens.RedisClient)
    private readonly redis: Redis,

    /**
     * Application logger.
     */
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,

    /**
     * Cache instrumentation service.
     */
    private readonly cacheMetrics: CacheMetrics,
  ) {}

  /**
   * Reads and deserializes a cached value.
   *
   * Returns null when:
   * - The key does not exist.
   * - Redis fails.
   * - Deserialization fails.
   */
  async get<T>(key: string): Promise<T | null> {
    const startedAt = performance.now();

    try {
      const value = await this.redis.get(key);

      if (value === null) {
        this.cacheMetrics.recordMiss(key);
        return null;
      }

      this.cacheMetrics.recordHit(key);

      return cacheSerializer.deserialize<T>(value);
    } catch (error) {
      this.cacheMetrics.recordFailure(CacheOperation.GET, key, error);

      this.logger.error('Failed to get value from cache for key', { error, key });

      /**
       * A cache read failure does not fail the main request.
       * The caller can normally fetch the value from the database.
       */
      return null;
    } finally {
      this.cacheMetrics.recordLatency(CacheOperation.GET, key, performance.now() - startedAt);
    }
  }

  /**
   * Serializes and stores a value in Redis.
   *
   * If a positive TTL is supplied, Redis receives an EX option.
   * Otherwise, the value is stored without expiration.
   */
  async set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
    const startedAt = performance.now();

    try {
      const serializedValue = cacheSerializer.serialize(value);

      if (ttlInSeconds !== undefined && ttlInSeconds > 0) {
        await this.redis.set(key, serializedValue, 'EX', ttlInSeconds);
      } else {
        await this.redis.set(key, serializedValue);
      }

      this.cacheMetrics.recordSet(key);
    } catch (error) {
      this.cacheMetrics.recordFailure(CacheOperation.SET, key, error);

      this.logger.error('Failed to set value in cache for key', { error, key });
    } finally {
      this.cacheMetrics.recordLatency(CacheOperation.SET, key, performance.now() - startedAt);
    }
  }

  /**
   * Deletes a cache key.
   *
   * Deletion failures are logged but not rethrown.
   */
  async delete(key: string): Promise<void> {
    const startedAt = performance.now();

    try {
      await this.redis.del(key);

      this.cacheMetrics.recordDelete(key);
    } catch (error) {
      this.cacheMetrics.recordFailure(CacheOperation.DELETE, key, error);

      this.logger.error('Failed to delete value from cache for key', { error, key });
    } finally {
      this.cacheMetrics.recordLatency(CacheOperation.DELETE, key, performance.now() - startedAt);
    }
  }

  /**
   * Checks whether a key exists.
   *
   * Redis returns 1 when the key exists and 0 otherwise.
   */
  async exists(key: string): Promise<boolean> {
    const startedAt = performance.now();

    try {
      if ((await this.redis.exists(key)) === 1) {
        this.cacheMetrics.recordExists(key);
        return true;
      }

      return false;
    } catch (error) {
      this.cacheMetrics.recordFailure(CacheOperation.EXISTS, key, error);

      this.logger.error('Failed to check if key exists in cache', { error, key });

      return false;
    } finally {
      this.cacheMetrics.recordLatency(CacheOperation.EXISTS, key, performance.now() - startedAt);
    }
  }

  /**
   * Updates the expiration time of an existing key.
   */
  async expire(key: string, ttlInSeconds: number): Promise<void> {
    const startedAt = performance.now();

    try {
      await this.redis.expire(key, ttlInSeconds);

      this.cacheMetrics.recordExpire(key, ttlInSeconds);
    } catch (error) {
      this.cacheMetrics.recordFailure(CacheOperation.EXPIRE, key, error);

      this.logger.error('Failed to update cache expiration for key', { error, key });
    } finally {
      this.cacheMetrics.recordLatency(CacheOperation.EXPIRE, key, performance.now() - startedAt);
    }
  }

  /**
   * Atomically increments a numeric Redis value.
   *
   * Returns zero when the operation fails.
   */
  async increment(key: string): Promise<number> {
    const startedAt = performance.now();

    try {
      const result = await this.redis.incr(key);

      this.cacheMetrics.recordIncrement(key);

      return result;
    } catch (error) {
      this.cacheMetrics.recordFailure(CacheOperation.INCREMENT, key, error);

      this.logger.error('Failed to increment value in cache for key', { error, key });

      return 0;
    } finally {
      this.cacheMetrics.recordLatency(CacheOperation.INCREMENT, key, performance.now() - startedAt);
    }
  }
}
