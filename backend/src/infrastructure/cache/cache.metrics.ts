import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';

/**
 * Records cache-related diagnostic information.
 *
 * The current implementation writes metrics through the
 * application logger. It does not currently send metrics
 * to a separate monitoring system.
 */
@injectable()
export class CacheMetrics {
  constructor(
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  /**
   * Records that a cache key was found.
   */
  recordHit(cacheKey: string): void {
    this.logger.debug('Cache hit', { cacheKey });
  }

  /**
   * Records that a cache key was not found.
   */
  recordMiss(cacheKey: string): void {
    this.logger.debug('Cache miss', { cacheKey });
  }

  /**
   * Records a successful cache write.
   */
  recordSet(cacheKey: string): void {
    this.logger.debug('Cache set', { cacheKey });
  }

  /**
   * Records a successful cache deletion.
   */
  recordDelete(cacheKey: string): void {
    this.logger.debug('Cache delete', { cacheKey });
  }

  /**
   * Records a cache existence check.
   */
  recordExists(cacheKey: string): void {
    this.logger.debug('Cache exists check', { cacheKey });
  }

  /**
   * Records a successful increment operation.
   */
  recordIncrement(cacheKey: string): void {
    this.logger.debug('Cache increment', { cacheKey });
  }

  /**
   * Records that an expiry was configured.
   */
  recordExpire(cacheKey: string, ttlInSeconds: number): void {
    this.logger.debug('Cache expiry set', {
      cacheKey,
      ttlInSeconds,
    });
  }

  /**
   * Records a failed cache operation.
   */
  recordFailure(operation: string, key: string, error: unknown): void {
    this.logger.warn('Cache operation failed', {
      operation,
      key,
      error,
    });
  }

  /**
   * Records how long a cache operation took.
   */
  recordLatency(operation: string, key: string, durationMs: number): void {
    this.logger.debug('Cache latency', {
      operation,
      key,
      durationMs,
    });
  }
}
