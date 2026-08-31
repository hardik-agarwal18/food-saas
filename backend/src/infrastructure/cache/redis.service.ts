import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/index.js';

import type { Logger } from 'pino';
import type { Redis } from 'ioredis';

@injectable()
export class RedisService {
  constructor(
    @inject(InfrastructureTokens.RedisClient) private readonly redis: Redis,
    @inject(InfrastructureTokens.Logger) private readonly logger: Logger,
  ) {}

  async connectToRedis(): Promise<void> {
    try {
      this.logger.info('Connecting to Redis...');
      await this.redis.connect();

      this.logger.info('Connected to Redis successfully');
    } catch (error) {
      this.logger.fatal({ error }, 'Failed to connect to Redis');
    }
  }

  async disconnectFromRedis(): Promise<void> {
    try {
      this.logger.info('Disconnecting from Redis...');

      await this.redis.quit();

      this.logger.info('Disconnected from Redis successfully');
    } catch (error) {
      this.logger.fatal({ error }, 'Failed to disconnect from Redis');
    }
  }
}
