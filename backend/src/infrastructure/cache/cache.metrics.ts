import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/index.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';

@injectable()
export class CacheMetrics {
  constructor(@inject(InfrastructureTokens.Logger) private readonly logger: ILogger) {}

  recordHit(cacheKey: string): void {
    this.logger.debug('Cache hit', { cacheKey });
  }

  recordMiss(cacheKey: string): void {
    this.logger.debug('Cache miss', { cacheKey });
  }

  recordSet(cacheKey: string): void {
    this.logger.debug('Cache set', { cacheKey });
  }

  recordDelete(cacheKey: string): void {
    this.logger.debug('Cache delete', { cacheKey });
  }

  recordExists(cacheKey: string): void {
    this.logger.debug('Cache exists check', { cacheKey });
  }
  recordIncrement(cacheKey: string): void {
    this.logger.debug('Cache increment', { cacheKey });
  }

  recordExpire(cacheKey: string, ttlInSeconds: number): void {
    this.logger.debug('Cache expiry set', { cacheKey, ttlInSeconds });
  }

  recordFailure(operation: string, key: string, error: unknown): void {
    this.logger.warn('Cache operation failed', { operation, key, error });
  }

  recordLatency(operation: string, key: string, durationMs: number): void {
    this.logger.debug('Cache latency', {
      operation,
      key,
      durationMs,
    });
  }
}
