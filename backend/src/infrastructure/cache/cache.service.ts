import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/index.js';
import { cacheSerializer } from './cache.serializer.js';
import { CacheMetrics } from './cache.metrics.js';
import { CacheOperation as cacheOperations } from './cache.enum.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';
import type { Redis } from 'ioredis';

@injectable()
export class CacheService {
  constructor(
    @inject(InfrastructureTokens.RedisClient)
    private readonly redis: Redis,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,

    private readonly cacheMetrics: CacheMetrics,
  ) {}

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
      this.cacheMetrics.recordFailure(cacheOperations.GET, key, error);

      this.logger.error('Failed to get value from cache for key', { error, key });
      return null;
    } finally {
      this.cacheMetrics.recordLatency(cacheOperations.GET, key, performance.now() - startedAt);
    }
  }

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
      this.cacheMetrics.recordFailure(cacheOperations.SET, key, error);

      this.logger.error('Failed to set value in cache for key', { error, key });
    } finally {
      this.cacheMetrics.recordLatency(cacheOperations.SET, key, performance.now() - startedAt);
    }
  }

  async delete(key: string): Promise<void> {
    const startedAt = performance.now();

    try {
      await this.redis.del(key);

      this.cacheMetrics.recordDelete(key);
    } catch (error) {
      this.cacheMetrics.recordFailure(cacheOperations.DELETE, key, error);

      this.logger.error('Failed to delete value from cache for key', { error, key });
    } finally {
      this.cacheMetrics.recordLatency(cacheOperations.DELETE, key, performance.now() - startedAt);
    }
  }

  async exists(key: string): Promise<boolean> {
    const startedAt = performance.now();

    try {
      if ((await this.redis.exists(key)) === 1) {
        this.cacheMetrics.recordExists(key);
        return true;
      }

      return false;
    } catch (error) {
      this.cacheMetrics.recordFailure(cacheOperations.EXISTS, key, error);

      this.logger.error('Failed to check if key exists in cache', { error, key });
      return false;
    } finally {
      this.cacheMetrics.recordLatency(cacheOperations.EXISTS, key, performance.now() - startedAt);
    }
  }

  async expire(key: string, ttlInSeconds: number): Promise<void> {
    const startedAt = performance.now();

    try {
      await this.redis.expire(key, ttlInSeconds);

      this.cacheMetrics.recordExpire(key, ttlInSeconds);
    } catch (error) {
      this.cacheMetrics.recordFailure(cacheOperations.EXPIRE, key, error);

      this.logger.error('Failed to update cache expiration for key', { error, key });
    } finally {
      this.cacheMetrics.recordLatency(cacheOperations.EXPIRE, key, performance.now() - startedAt);
    }
  }

  async increment(key: string): Promise<number> {
    const startedAt = performance.now();

    try {
      const res = await this.redis.incr(key);
      this.cacheMetrics.recordIncrement(key);

      return res;
    } catch (error) {
      this.cacheMetrics.recordFailure(cacheOperations.INCREMENT, key, error);

      this.logger.error('Failed to increment value in cache for key', { error, key });
      return 0;
    } finally {
      this.cacheMetrics.recordLatency(
        cacheOperations.INCREMENT,
        key,
        performance.now() - startedAt,
      );
    }
  }
}
