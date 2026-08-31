import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/index.js';

import type { ILogger } from '../../shared/logger/logger.interface.js';
import type { Redis } from 'ioredis';

@injectable()
export class RedisService {
  constructor(
    @inject(InfrastructureTokens.RedisClient) private readonly redis: Redis,
    @inject(InfrastructureTokens.Logger) private readonly logger: ILogger,
  ) {}

  async connectToRedis(): Promise<void> {
    try {
      this.logger.info('Connecting to Redis...');
      await this.redis.connect();

      this.logger.info('Connected to Redis successfully');
    } catch (error) {
      this.logger.fatal('Failed to connect to Redis', error);
    }
  }

  async disconnectFromRedis(): Promise<void> {
    try {
      this.logger.info('Disconnecting from Redis...');

      await this.redis.quit();

      this.logger.info('Disconnected from Redis successfully');
    } catch (error) {
      this.logger.fatal('Failed to disconnect from Redis', error);
    }
  }

  async checkRedisHealth() {
    try {
      const startedAt = process.hrtime.bigint();

      await this.redis.ping();

      const latency = Number(process.hrtime.bigint() - startedAt) / 1_000_000; // Convert to milliseconds

      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return { status: 'unhealthy' };
    }
  }
}
