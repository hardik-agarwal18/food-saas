import { logger } from '../../config/logger.js';

export class CacheMetrics {
  recordHit(cacheKey: string): void {
    logger.debug({ cacheKey }, 'Cache hit');
  }

  recordMiss(cacheKey: string): void {
    logger.debug({ cacheKey }, 'Cache miss');
  }

  recordSet(cacheKey: string): void {
    logger.debug({ cacheKey }, 'Cache set');
  }

  recordDelete(cacheKey: string): void {
    logger.debug({ cacheKey }, 'Cache delete');
  }

  recordExists(cacheKey: string): void {
    logger.debug({ cacheKey }, 'Cache exists check');
  }
  recordIncrement(cacheKey: string): void {
    logger.debug({ cacheKey }, 'Cache increment');
  }

  recordExpire(cacheKey: string, ttlInSeconds: number): void {
    logger.debug({ cacheKey, ttlInSeconds }, 'Cache expiry set');
  }

  recordFailure(operation: string, key: string, error: unknown): void {
    logger.warn({ operation, key, error }, 'Cache operation failed');
  }

  recordLatency(operation: string, key: string, durationMs: number): void {
    logger.debug(
      {
        operation,
        key,
        durationMs,
      },
      'Cache latency',
    );
  }
}

export const cacheMetrics = new CacheMetrics();
